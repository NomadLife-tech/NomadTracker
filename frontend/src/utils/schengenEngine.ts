/**
 * SCHENGEN ENGINE - European Commission Compliant 90/180 Day Calculator
 * 
 * This module implements the official Schengen short-stay calculator methodology
 * using discrete date-array mapping with rolling sum validation.
 * 
 * Architecture:
 * 1. Date-Array Mapping: Convert visits to boolean[] where each index = calendar day
 * 2. Rolling Sum: Calculate Σ(k=0 to 179) StateArray[T_i - k] for any target date
 * 3. Strict Validation: Check invariant for EVERY day in a trip (not just endpoints)
 * 4. Forward Simulation: Calculate max stay and legal re-entry dates
 * 
 * @author Nomad Tracker
 * @version 2.0.0 - EU Commission Compliant
 */

import { 
  differenceInDays, 
  addDays, 
  subDays, 
  startOfDay, 
  format, 
  parseISO,
  isBefore,
  isAfter,
  isSameDay,
  eachDayOfInterval
} from 'date-fns';
import { Visit, Passport } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Official Schengen Area member states (as of 2024)
 * Note: Cyprus, Ireland, and Bulgaria/Romania are EU but NOT Schengen
 */
export const SCHENGEN_COUNTRIES = [
  'AT', // Austria
  'BE', // Belgium
  'CZ', // Czech Republic (Czechia)
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IS', // Iceland (EEA)
  'IT', // Italy
  'LV', // Latvia
  'LI', // Liechtenstein (EEA)
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'NO', // Norway (EEA)
  'PL', // Poland
  'PT', // Portugal
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
  'CH', // Switzerland (EFTA)
  'HR', // Croatia (joined 2023)
  'BG', // Bulgaria (joined 2024 - air/sea only initially)
  'RO', // Romania (joined 2024 - air/sea only initially)
];

/**
 * Countries whose passport holders have Schengen freedom of movement
 * (EU member states + EEA + Switzerland) - exempt from 90/180 rule
 */
export const SCHENGEN_FREE_MOVEMENT_COUNTRIES = [
  // EU Member States (27 countries)
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA (non-EU)
  'IS', 'LI', 'NO',
  // EFTA
  'CH',
];

/**
 * Visa type patterns that are EXEMPT from 90/180 counting
 * (National D visas, residence permits, long-stay visas)
 */
const EXEMPT_VISA_PATTERNS = [
  'national d', 'd visa', 'type d', 'long stay', 'long-stay',
  'digital nomad', 'nomad residence', 'nomad permit',
  'work permit', 'work visa', 'eu blue card', 'blue card',
  'student visa', 'student permit', 'residence permit', 'residence visa',
  'freelance', 'golden visa', 'talent passport', 'startup', 'entrepreneur',
  'investor', 'remotely from', 'remote work', 'employee card',
  'red-white-red', 'zivno', 'vls-ts', 'working holiday',
  'eu citizen', // EU citizens have unlimited stay
];

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Result of Schengen compliance validation
 */
export interface SchengenValidationResult {
  /** Whether the trip/current state is compliant */
  valid: boolean;
  /** Date when overstay occurs (if invalid) */
  overstayDate?: Date;
  /** Number of days over 90 on overstay date */
  overstayAmount?: number;
  /** Total Schengen days used as of today (or end of proposed trip) */
  daysUsed: number;
  /** Days remaining out of 90 as of today */
  daysRemaining: number;
  /** Start of the current 180-day rolling window */
  periodStartDate: string;
  /** End of the current 180-day rolling window (today) */
  periodEndDate: string;
}

/**
 * Extended Schengen status with forward-looking calculations
 */
export interface SchengenStatusExtended extends SchengenValidationResult {
  /** Maximum consecutive days user can stay starting today */
  maxStayFromToday: number;
  /** Earliest date user can enter for a fresh 90-day stay */
  legalFullReEntryDate: Date;
  /** Whether user has a "soft reset" (90+ day gap) */
  hasSoftReset: boolean;
  /** Whether user has a "full reset" (180+ day gap) */
  hasFullReset: boolean;
  /** Date of last Schengen exit (if any recent) */
  lastSchengenExit?: Date;
  /** Breakdown by country */
  countryBreakdown: SchengenCountryBreakdown[];
}

/**
 * Per-country breakdown of Schengen days
 */
export interface SchengenCountryBreakdown {
  countryCode: string;
  countryName: string;
  days: number;
  visaType: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a country is in the Schengen Area
 */
export function isSchengenCountry(countryCode: string): boolean {
  return SCHENGEN_COUNTRIES.includes(countryCode);
}

/**
 * Check if a passport grants Schengen freedom of movement (exempt from 90/180)
 */
export function hasSchengenFreeMovement(passportCountryCode: string): boolean {
  return SCHENGEN_FREE_MOVEMENT_COUNTRIES.includes(passportCountryCode);
}

/**
 * Determine if a visa type counts against the 90/180 Schengen limit
 * 
 * @param visaType - The visa type string
 * @returns true if it COUNTS against 90/180, false if EXEMPT
 */
export function countsAgainstSchengen(visaType: string): boolean {
  if (!visaType) return true; // Conservative: unknown visa counts
  
  const visaTypeLower = visaType.toLowerCase();
  
  // Check if visa type matches any exempt pattern
  for (const pattern of EXEMPT_VISA_PATTERNS) {
    if (visaTypeLower.includes(pattern)) {
      return false; // Does NOT count against Schengen
    }
  }
  
  // Default: assume it counts (conservative approach)
  return true;
}

/**
 * Check if a visit should count against Schengen based on passport used
 * 
 * @param visit - The visit to check
 * @param passports - User's registered passports
 * @returns true if visit COUNTS against 90/180, false if EXEMPT
 */
export function visitCountsForSchengen(visit: Visit, passports: Passport[]): boolean {
  // Must be a Schengen country
  if (!isSchengenCountry(visit.countryCode)) {
    return false;
  }
  
  // Must be a counting visa type
  if (!countsAgainstSchengen(visit.visaType)) {
    return false;
  }
  
  // If no passport specified, assume it counts (conservative)
  if (!visit.passportId) {
    return true;
  }
  
  // Find the passport used
  const passportUsed = passports.find(p => p.id === visit.passportId);
  if (!passportUsed) {
    return true; // Passport not found, assume it counts
  }
  
  // EU/EEA/Swiss passport holders are exempt
  if (hasSchengenFreeMovement(passportUsed.countryCode)) {
    return false;
  }
  
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE ARCHITECTURE: DATE-ARRAY MAPPING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a boolean state array mapping each calendar day to Schengen presence
 * 
 * This is the CORE of the EU-compliant algorithm. Each day is mapped to:
 * - true: Present in Schengen Area (entry, exit, transit, or full day)
 * - false: Outside Schengen or exempt (long-stay visa, non-Schengen EU, etc.)
 * 
 * Overlapping visits are handled with logical OR (day counted only once)
 * 
 * @param visits - All user visits
 * @param passports - User's passports (for exemption checking)
 * @param startDate - Start of the array period
 * @param endDate - End of the array period
 * @returns Boolean array where index 0 = startDate
 */
export function buildSchengenStateArray(
  visits: Visit[],
  passports: Passport[],
  startDate: Date,
  endDate: Date
): boolean[] {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const totalDays = differenceInDays(end, start) + 1;
  
  // Initialize all days as false (not in Schengen)
  const stateArray: boolean[] = new Array(totalDays).fill(false);
  
  // Filter to only visits that count against Schengen
  const countingVisits = visits.filter(v => visitCountsForSchengen(v, passports));
  
  // Map each counting visit to the state array
  for (const visit of countingVisits) {
    const visitEntry = startOfDay(parseISO(visit.entryDate));
    const visitExit = visit.exitDate 
      ? startOfDay(parseISO(visit.exitDate))
      : startOfDay(new Date()); // If no exit, assume still there
    
    // Get all days in this visit
    const visitDays = eachDayOfInterval({ 
      start: visitEntry, 
      end: visitExit 
    });
    
    // Mark each day as true in the array (logical OR for overlaps)
    for (const day of visitDays) {
      const dayIndex = differenceInDays(day, start);
      
      // Only mark if within our array bounds
      if (dayIndex >= 0 && dayIndex < totalDays) {
        stateArray[dayIndex] = true;
      }
    }
  }
  
  return stateArray;
}

/**
 * Convert array index to actual date
 */
export function indexToDate(index: number, arrayStartDate: Date): Date {
  return addDays(startOfDay(arrayStartDate), index);
}

/**
 * Convert date to array index
 */
export function dateToIndex(date: Date, arrayStartDate: Date): number {
  return differenceInDays(startOfDay(date), startOfDay(arrayStartDate));
}

// ═══════════════════════════════════════════════════════════════════════════
// MATHEMATICAL CORE: ROLLING SUM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate Schengen days used as of a target date using the rolling sum formula
 * 
 * Formula: SchengenDays(T_i) = Σ(k=0 to 179) StateArray[T_i - k]
 * 
 * This sums up all days where the user was in Schengen within the
 * 180-day window ending on the target date.
 * 
 * @param targetDate - The date to calculate for
 * @param stateArray - Boolean array from buildSchengenStateArray
 * @param arrayStartDate - The start date of the array (index 0)
 * @returns Number of Schengen days in the 180-day window ending on targetDate
 */
export function calculateSchengenDaysOnDate(
  targetDate: Date,
  stateArray: boolean[],
  arrayStartDate: Date
): number {
  const targetIndex = dateToIndex(targetDate, arrayStartDate);
  
  let sum = 0;
  
  // Sum the previous 180 days (indices targetIndex-179 to targetIndex inclusive)
  for (let k = 0; k < 180; k++) {
    const checkIndex = targetIndex - k;
    
    // If index is out of bounds (before array start), treat as false
    if (checkIndex >= 0 && checkIndex < stateArray.length) {
      if (stateArray[checkIndex]) {
        sum++;
      }
    }
    // If checkIndex < 0, that day is before our data, assume not in Schengen
  }
  
  return sum;
}

// ═══════════════════════════════════════════════════════════════════════════
// STRICT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate Schengen compliance with per-day checking
 * 
 * This checks the strict invariant:
 * ∀ T_i ∈ {PlanStart...PlanEnd}, SchengenDays(T_i) ≤ 90
 * 
 * If any single day returns ≥91, it identifies the exact overstay date.
 * 
 * @param visits - All user visits
 * @param passports - User's passports
 * @param proposedTrip - Optional proposed trip to validate
 * @returns Validation result with overstay details if invalid
 */
export function validateSchengenCompliance(
  visits: Visit[],
  passports: Passport[],
  proposedTrip?: { start: Date; end: Date }
): SchengenValidationResult {
  const today = startOfDay(new Date());
  
  // Determine the date range to validate
  let validationEndDate: Date;
  if (proposedTrip) {
    validationEndDate = startOfDay(proposedTrip.end);
  } else {
    // Find the latest exit date among current/future visits, or today
    const latestDate = visits.reduce((latest, v) => {
      if (v.exitDate) {
        const exit = startOfDay(parseISO(v.exitDate));
        return isAfter(exit, latest) ? exit : latest;
      }
      return latest;
    }, today);
    validationEndDate = latestDate;
  }
  
  // Build array with 180-day buffer before earliest relevant date
  // and extending to the validation end date
  const arrayStartDate = subDays(today, 360); // Plenty of buffer
  const arrayEndDate = addDays(validationEndDate, 1);
  
  // Create visits array including proposed trip if provided
  let allVisits = [...visits];
  if (proposedTrip) {
    // Add proposed trip as a temporary visit for validation
    allVisits = [...visits, {
      id: 'proposed-trip',
      countryCode: 'PROPOSED', // Will be treated as Schengen
      countryName: 'Proposed Trip',
      entryDate: format(proposedTrip.start, 'yyyy-MM-dd'),
      exitDate: format(proposedTrip.end, 'yyyy-MM-dd'),
      visaType: 'Tourist', // Assume counting visa type
      passportId: '',
    } as Visit];
  }
  
  // Build state array
  const stateArray = buildSchengenStateArray(allVisits, passports, arrayStartDate, arrayEndDate);
  
  // If validating a proposed trip, mark those days as true
  if (proposedTrip) {
    const tripDays = eachDayOfInterval({
      start: startOfDay(proposedTrip.start),
      end: startOfDay(proposedTrip.end)
    });
    for (const day of tripDays) {
      const idx = dateToIndex(day, arrayStartDate);
      if (idx >= 0 && idx < stateArray.length) {
        stateArray[idx] = true;
      }
    }
  }
  
  // Calculate current status (as of today)
  const daysUsedToday = calculateSchengenDaysOnDate(today, stateArray, arrayStartDate);
  
  // Determine validation range
  const validationStart = proposedTrip ? startOfDay(proposedTrip.start) : today;
  const validationEnd = validationEndDate;
  
  // Check every day in the validation range
  let overstayDate: Date | undefined;
  let overstayAmount: number | undefined;
  let isValid = true;
  
  const daysToCheck = eachDayOfInterval({ start: validationStart, end: validationEnd });
  
  for (const checkDate of daysToCheck) {
    const daysOnDate = calculateSchengenDaysOnDate(checkDate, stateArray, arrayStartDate);
    
    if (daysOnDate > 90) {
      isValid = false;
      overstayDate = checkDate;
      overstayAmount = daysOnDate - 90;
      break; // Stop at first violation
    }
  }
  
  return {
    valid: isValid,
    overstayDate,
    overstayAmount,
    daysUsed: daysUsedToday,
    daysRemaining: Math.max(0, 90 - daysUsedToday),
    periodStartDate: format(subDays(today, 179), 'yyyy-MM-dd'),
    periodEndDate: format(today, 'yyyy-MM-dd'),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FORWARD SIMULATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate maximum consecutive days a user can stay in Schengen
 * starting from a given entry date without violating the 90/180 rule
 * 
 * Uses iterative look-ahead: for each additional day, check if
 * adding that day would cause any day's rolling sum to exceed 90.
 * 
 * @param entryDate - The planned entry date
 * @param visits - All user visits
 * @param passports - User's passports
 * @returns Maximum number of consecutive days (0 if cannot enter at all)
 */
export function calculateMaxStay(
  entryDate: Date,
  visits: Visit[],
  passports: Passport[]
): number {
  const entry = startOfDay(entryDate);
  
  // Build array from 180 days before entry to 180 days after (for simulation)
  const arrayStartDate = subDays(entry, 180);
  const arrayEndDate = addDays(entry, 180);
  
  const stateArray = buildSchengenStateArray(visits, passports, arrayStartDate, arrayEndDate);
  
  // Check if we can even enter on day 1
  const entryIndex = dateToIndex(entry, arrayStartDate);
  
  // Simulate adding one day at a time
  let maxDays = 0;
  
  for (let dayOffset = 0; dayOffset < 180; dayOffset++) {
    const simulatedDate = addDays(entry, dayOffset);
    const simIndex = dateToIndex(simulatedDate, arrayStartDate);
    
    // Temporarily mark this day as in Schengen
    if (simIndex >= 0 && simIndex < stateArray.length) {
      stateArray[simIndex] = true;
    }
    
    // Check if this causes a violation
    const daysOnSimDate = calculateSchengenDaysOnDate(simulatedDate, stateArray, arrayStartDate);
    
    if (daysOnSimDate > 90) {
      // This day would cause overstay - revert and stop
      if (simIndex >= 0 && simIndex < stateArray.length) {
        // Only revert if it wasn't already true from existing visits
        const originalArray = buildSchengenStateArray(visits, passports, arrayStartDate, arrayEndDate);
        stateArray[simIndex] = originalArray[simIndex];
      }
      break;
    }
    
    maxDays = dayOffset + 1; // +1 because dayOffset is 0-indexed
  }
  
  return maxDays;
}

/**
 * Calculate the earliest date on which a user can enter Schengen
 * and stay for a FULL uninterrupted 90 days without any rolling sum
 * exceeding 90 on any day during that 90-day period.
 * 
 * Algorithm:
 * 1. Start from today
 * 2. For each candidate date D, simulate staying 90 days (D to D+89)
 * 3. Check if ALL days in that 90-day window have rolling sum ≤ 90
 * 4. Return first D that passes
 * 
 * @param visits - All user visits
 * @param passports - User's passports
 * @param today - Reference date (defaults to actual today)
 * @returns Earliest date for a legal full 90-day entry
 */
export function calculateLegalFullReEntryDate(
  visits: Visit[],
  passports: Passport[],
  today: Date = new Date()
): Date {
  const todayStart = startOfDay(today);
  
  // Build a large enough array to simulate up to 270 days out
  // (worst case: need to wait 180 days for full reset)
  const arrayStartDate = subDays(todayStart, 180);
  const arrayEndDate = addDays(todayStart, 270);
  
  const baseStateArray = buildSchengenStateArray(visits, passports, arrayStartDate, arrayEndDate);
  
  // Try each candidate entry date starting from today
  for (let daysFromToday = 0; daysFromToday <= 180; daysFromToday++) {
    const candidateEntry = addDays(todayStart, daysFromToday);
    
    // Create a copy of state array to simulate
    const simArray = [...baseStateArray];
    
    // Mark the 90 days starting from candidate entry
    const tripEnd = addDays(candidateEntry, 89); // 90 days inclusive
    
    for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
      const tripDay = addDays(candidateEntry, dayOffset);
      const idx = dateToIndex(tripDay, arrayStartDate);
      if (idx >= 0 && idx < simArray.length) {
        simArray[idx] = true;
      }
    }
    
    // Check if ALL 90 days are compliant
    let allDaysCompliant = true;
    
    for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
      const checkDate = addDays(candidateEntry, dayOffset);
      const daysOnCheckDate = calculateSchengenDaysOnDate(checkDate, simArray, arrayStartDate);
      
      if (daysOnCheckDate > 90) {
        allDaysCompliant = false;
        break;
      }
    }
    
    if (allDaysCompliant) {
      return candidateEntry;
    }
  }
  
  // If we can't find a date within 180 days, return 180 days from today
  // (full reset will definitely allow it)
  return addDays(todayStart, 180);
}

// ═══════════════════════════════════════════════════════════════════════════
// GAP DETECTION (SOFT RESET / FULL RESET)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect Schengen "reset" gaps in travel history
 * 
 * - Soft Reset: 90+ consecutive days outside Schengen (counter "recharges")
 * - Full Reset: 180+ consecutive days outside Schengen (complete clean slate)
 * 
 * @param visits - All user visits
 * @param passports - User's passports
 * @returns Reset detection result
 */
export function detectSchengenResets(
  visits: Visit[],
  passports: Passport[]
): { hasSoftReset: boolean; hasFullReset: boolean; resetDate?: Date; gapLength: number } {
  const today = startOfDay(new Date());
  const arrayStartDate = subDays(today, 365);
  
  const stateArray = buildSchengenStateArray(visits, passports, arrayStartDate, today);
  
  // Find the longest consecutive sequence of false (outside Schengen)
  let maxGap = 0;
  let currentGap = 0;
  let gapEndIndex = -1;
  
  for (let i = 0; i < stateArray.length; i++) {
    if (!stateArray[i]) {
      currentGap++;
      if (currentGap > maxGap) {
        maxGap = currentGap;
        gapEndIndex = i;
      }
    } else {
      currentGap = 0;
    }
  }
  
  // Also check trailing gap (from last Schengen day to today)
  if (currentGap > maxGap) {
    maxGap = currentGap;
    gapEndIndex = stateArray.length - 1;
  }
  
  const hasSoftReset = maxGap >= 90;
  const hasFullReset = maxGap >= 180;
  
  let resetDate: Date | undefined;
  if (hasSoftReset && gapEndIndex >= 0) {
    // Reset date is the last day of the gap (when reset completes)
    resetDate = indexToDate(gapEndIndex, arrayStartDate);
  }
  
  return {
    hasSoftReset,
    hasFullReset,
    resetDate,
    gapLength: maxGap,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CALCULATION FUNCTION (REPLACES OLD calculateSchengenDays)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate comprehensive Schengen status with all extended information
 * 
 * This is the main entry point that replaces the old calculateSchengenDays function.
 * It provides all the information needed for the dashboard display.
 * 
 * @param visits - All user visits
 * @param passports - User's passports
 * @returns Extended Schengen status with all calculations
 */
export function calculateSchengenStatusExtended(
  visits: Visit[],
  passports: Passport[]
): SchengenStatusExtended {
  const today = startOfDay(new Date());
  
  // Get basic validation
  const validation = validateSchengenCompliance(visits, passports);
  
  // Calculate max stay from today
  const maxStayFromToday = calculateMaxStay(today, visits, passports);
  
  // Calculate legal full re-entry date
  const legalFullReEntryDate = calculateLegalFullReEntryDate(visits, passports, today);
  
  // Detect resets
  const resets = detectSchengenResets(visits, passports);
  
  // Find last Schengen exit
  let lastSchengenExit: Date | undefined;
  const countingVisits = visits.filter(v => visitCountsForSchengen(v, passports));
  const completedVisits = countingVisits.filter(v => v.exitDate);
  if (completedVisits.length > 0) {
    const sorted = completedVisits.sort((a, b) => 
      new Date(b.exitDate!).getTime() - new Date(a.exitDate!).getTime()
    );
    lastSchengenExit = parseISO(sorted[0].exitDate!);
  }
  
  // Calculate country breakdown
  const countryBreakdown = getSchengenBreakdownByCountry(visits, passports);
  
  return {
    ...validation,
    maxStayFromToday,
    legalFullReEntryDate,
    hasSoftReset: resets.hasSoftReset,
    hasFullReset: resets.hasFullReset,
    lastSchengenExit,
    countryBreakdown,
  };
}

/**
 * Get breakdown of Schengen days by country within the 180-day window
 */
export function getSchengenBreakdownByCountry(
  visits: Visit[],
  passports: Passport[]
): SchengenCountryBreakdown[] {
  const today = startOfDay(new Date());
  const periodStart = subDays(today, 179);
  
  const countingVisits = visits.filter(v => visitCountsForSchengen(v, passports));
  
  const breakdown: Map<string, SchengenCountryBreakdown> = new Map();
  
  for (const visit of countingVisits) {
    const entryDate = startOfDay(parseISO(visit.entryDate));
    const exitDate = visit.exitDate 
      ? startOfDay(parseISO(visit.exitDate))
      : today;
    
    // Calculate overlap with the 180-day period
    const overlapStart = isAfter(entryDate, periodStart) ? entryDate : periodStart;
    const overlapEnd = isBefore(exitDate, today) ? exitDate : today;
    
    if (isBefore(overlapStart, overlapEnd) || isSameDay(overlapStart, overlapEnd)) {
      const days = differenceInDays(overlapEnd, overlapStart) + 1;
      
      const key = `${visit.countryCode}-${visit.visaType}`;
      const existing = breakdown.get(key);
      
      if (existing) {
        existing.days += days;
      } else {
        breakdown.set(key, {
          countryCode: visit.countryCode,
          countryName: visit.countryName,
          days,
          visaType: visit.visaType,
        });
      }
    }
  }
  
  return Array.from(breakdown.values()).sort((a, b) => b.days - a.days);
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY (Bridge to old API)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Legacy function signature for backward compatibility
 * @deprecated Use calculateSchengenStatusExtended instead
 */
export function calculateSchengenDays(
  visits: Visit[],
  passports: Passport[] = []
): { daysUsedInPeriod: number; daysRemainingInPeriod: number; periodStartDate: string; periodEndDate: string } {
  const result = validateSchengenCompliance(visits, passports);
  return {
    daysUsedInPeriod: result.daysUsed,
    daysRemainingInPeriod: result.daysRemaining,
    periodStartDate: result.periodStartDate,
    periodEndDate: result.periodEndDate,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS FOR TESTING
// ═══════════════════════════════════════════════════════════════════════════

export const __testing = {
  buildSchengenStateArray,
  calculateSchengenDaysOnDate,
  dateToIndex,
  indexToDate,
};
