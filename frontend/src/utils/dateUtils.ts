import { differenceInDays, parseISO, isAfter, isBefore, isWithinInterval, format, subDays, addDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { Visit, VisaStatus, SchengenStatus, Passport } from '../types';

/**
 * Get the current date/time using device's local time
 * Simple and reliable - uses JavaScript's native Date which respects device timezone
 */
export function getNow(): Date {
  return new Date();
}

/**
 * Get the start of today (midnight) in device's local timezone
 * This is the primary function for "what day is it for the user"
 */
export function getToday(): Date {
  return startOfDay(new Date());
}

/**
 * Extract date-only string (YYYY-MM-DD) from an ISO date string or Date object
 * This strips the time/timezone component for calendar day comparisons
 */
export function toDateOnly(dateInput: string | Date): string {
  if (typeof dateInput === 'string') {
    // Handle ISO strings like "2026-05-25T21:00:00.000Z" -> "2026-05-25"
    return dateInput.split('T')[0];
  }
  // Handle Date objects - format to local date
  return format(dateInput, 'yyyy-MM-dd');
}

/**
 * Parse a date string to local midnight Date object
 * This ensures all date comparisons happen at local midnight
 */
export function toLocalMidnight(dateInput: string | Date): Date {
  const dateOnly = toDateOnly(dateInput);
  // Parse as local date (not UTC) by using individual components
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

// Schengen countries
export const SCHENGEN_COUNTRIES = [
  'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
  'PT', 'SK', 'SI', 'ES', 'SE', 'CH', 'HR', 'BG'
];

// Countries whose passport holders have Schengen freedom of movement
// (EU member states + EEA + Switzerland)
export const SCHENGEN_FREE_MOVEMENT_COUNTRIES = [
  // EU Member States (27 countries)
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
  // EEA (non-EU)
  'IS', // Iceland
  'LI', // Liechtenstein
  'NO', // Norway
  // EFTA
  'CH', // Switzerland
];

/**
 * Check if a passport country grants Schengen freedom of movement
 * (i.e., the passport holder is NOT subject to 90/180 rule)
 */
export function hasSchengenFreeMovement(passportCountryCode: string): boolean {
  return SCHENGEN_FREE_MOVEMENT_COUNTRIES.includes(passportCountryCode);
}

/**
 * Check if a visit should count against Schengen 90/180 based on passport used
 * Returns false (doesn't count) if passport is from EU/EEA/Swiss country
 */
export function visitCountsForSchengen(visit: Visit, passports: Passport[]): boolean {
  // If no passport specified, assume it counts (conservative approach)
  if (!visit.passportId) {
    return true;
  }
  
  // Find the passport used for this visit
  const passportUsed = passports.find(p => p.id === visit.passportId);
  
  // If passport not found, assume it counts
  if (!passportUsed) {
    return true;
  }
  
  // If passport is from EU/EEA/Swiss country, it does NOT count against Schengen
  if (hasSchengenFreeMovement(passportUsed.countryCode)) {
    return false;
  }
  
  // Non-EU passport - it DOES count against Schengen
  return true;
}

export function isSchengenCountry(countryCode: string): boolean {
  return SCHENGEN_COUNTRIES.includes(countryCode);
}

/**
 * Determines if a visa type counts against Schengen 90/180 day limit.
 * 
 * COUNTS AGAINST SCHENGEN (Short-stay / Tourist):
 * - Schengen C (Short Stay) visas
 * - Visa Free entries
 * - Tourist visas in Schengen countries
 * - Transit visas
 * 
 * DOES NOT COUNT (National/Long-stay visas):
 * - National D Visa (long-stay)
 * - Digital Nomad Visa
 * - Work Permit / Work Visa
 * - EU Blue Card
 * - Student Visa
 * - Residence Permit
 * - Freelance Visa
 * - Golden Visa
 * - Any visa with duration > 90 days that is not short-stay
 */
export function countsAgainstSchengen(visaType: string): boolean {
  const visaTypeLower = visaType.toLowerCase();
  
  // These visa types DO NOT count against Schengen 90/180
  const exemptVisaPatterns = [
    'national d',
    'd visa',
    'long stay',
    'long-stay',
    'digital nomad',
    'nomad residence',
    'nomad permit',
    'work permit',
    'work visa',
    'eu blue card',
    'blue card',
    'student visa',
    'student permit',
    'residence permit',
    'residence visa',
    'freelance',
    'golden visa',
    'talent passport',
    'startup',
    'entrepreneur',
    'investor',
    'remotely from',
    'remote work',
    'employee card',
    'red-white-red',
    'zivno',
    'vls-ts', // French long-stay visa
    'type d',
    'working holiday',
  ];
  
  // Check if visa type matches any exempt pattern
  for (const pattern of exemptVisaPatterns) {
    if (visaTypeLower.includes(pattern)) {
      return false; // Does NOT count against Schengen
    }
  }
  
  // These visa types DO count against Schengen 90/180
  const countingVisaPatterns = [
    'schengen c',
    'schengen (short',
    'short stay',
    'short-stay',
    'visa free',
    'visa-free',
    'tourist',
    'transit',
    'type c',
    'c visa',
  ];
  
  // Check if it's a counting visa type
  for (const pattern of countingVisaPatterns) {
    if (visaTypeLower.includes(pattern)) {
      return true; // DOES count against Schengen
    }
  }
  
  // Default: if in Schengen country and no specific visa type identified,
  // assume it counts (conservative approach for tracking)
  return true;
}

// Calculate days spent in country (inclusive of entry day)
// Uses calendar day comparison - counts days from midnight to midnight
export function calculateDaysInCountry(entryDate: string, exitDate?: string): number {
  // Convert to local midnight dates for calendar day comparison
  const entry = toLocalMidnight(entryDate);
  const exit = exitDate ? toLocalMidnight(exitDate) : getToday();
  return differenceInDays(exit, entry) + 1; // +1 to include entry day
}

// Check if visit is currently active (user is currently in the country)
export function isCurrentVisit(visit: Visit): boolean {
  const today = getToday();
  
  // Parse entry date to local midnight using our helper
  const entryDate = toLocalMidnight(visit.entryDate);
  
  // Entry date must be today or in the past
  if (entryDate > today) {
    return false;
  }
  
  // If no exit date, the visit is ongoing
  if (!visit.exitDate) {
    return true;
  }
  
  // Parse exit date to local midnight
  const exitDate = toLocalMidnight(visit.exitDate);
  
  // If exit date is today or in the future, still active
  return exitDate >= today;
}

// Get visa status with all calculated fields
export function getVisaStatus(visit: Visit): VisaStatus {
  const daysUsed = calculateDaysInCountry(visit.entryDate, visit.exitDate);
  const allowedDays = visit.allowedDays || 90;
  const daysRemaining = Math.max(0, allowedDays - daysUsed);
  const percentageUsed = Math.min(100, (daysUsed / allowedDays) * 100);
  const isActive = isCurrentVisit(visit);
  const isOverstay = daysUsed > allowedDays;
  
  return {
    visit,
    daysUsed,
    daysRemaining,
    percentageUsed,
    isActive,
    isOverstay,
  };
}

// Schengen 90/180 rolling calculator
// Now based on VISA TYPE AND PASSPORT USED
// EU/EEA/Swiss passport holders are exempt from 90/180 rule
export function calculateSchengenDays(visits: Visit[], passports: Passport[] = []): SchengenStatus {
  const today = getToday();
  const periodEndDate = today;
  const periodStartDate = subDays(today, 179); // 180-day rolling window
  
  // Filter visits that:
  // 1. Are in Schengen countries AND
  // 2. Have a visa type that counts against Schengen 90/180 AND
  // 3. Were entered with a non-EU/EEA/Swiss passport
  const countingVisits = visits.filter(v => 
    isSchengenCountry(v.countryCode) && 
    countsAgainstSchengen(v.visaType) &&
    visitCountsForSchengen(v, passports)
  );
  
  let totalDays = 0;
  
  countingVisits.forEach(visit => {
    // Use local midnight dates for calendar day comparison
    const entryDate = toLocalMidnight(visit.entryDate);
    const exitDate = visit.exitDate ? toLocalMidnight(visit.exitDate) : today;
    
    // Calculate overlap with the 180-day period
    const overlapStart = isAfter(entryDate, periodStartDate) ? entryDate : periodStartDate;
    const overlapEnd = isBefore(exitDate, periodEndDate) ? exitDate : periodEndDate;
    
    if (isBefore(overlapStart, overlapEnd) || overlapStart.getTime() === overlapEnd.getTime()) {
      const days = differenceInDays(overlapEnd, overlapStart) + 1;
      totalDays += days;
    }
  });
  
  return {
    daysUsedInPeriod: totalDays,
    daysRemainingInPeriod: Math.max(0, 90 - totalDays),
    periodStartDate: format(periodStartDate, 'yyyy-MM-dd'),
    periodEndDate: format(periodEndDate, 'yyyy-MM-dd'),
  };
}

// Get Schengen visits breakdown by country (only counting visits)
export function getSchengenBreakdown(visits: Visit[], passports: Passport[] = []): { countryCode: string; countryName: string; days: number; visits: Visit[]; visaType: string }[] {
  const today = getToday();
  const periodEndDate = today;
  const periodStartDate = subDays(today, 179);
  
  // Only include visits that count against Schengen (including passport check)
  const countingVisits = visits.filter(v => 
    isSchengenCountry(v.countryCode) && 
    countsAgainstSchengen(v.visaType) &&
    visitCountsForSchengen(v, passports)
  );
  
  const breakdown: { [key: string]: { countryCode: string; countryName: string; days: number; visits: Visit[]; visaType: string } } = {};
  
  countingVisits.forEach(visit => {
    // Use local midnight dates for calendar day comparison
    const entryDate = toLocalMidnight(visit.entryDate);
    const exitDate = visit.exitDate ? toLocalMidnight(visit.exitDate) : today;
    
    const overlapStart = isAfter(entryDate, periodStartDate) ? entryDate : periodStartDate;
    const overlapEnd = isBefore(exitDate, periodEndDate) ? exitDate : periodEndDate;
    
    if (isBefore(overlapStart, overlapEnd) || overlapStart.getTime() === overlapEnd.getTime()) {
      const days = differenceInDays(overlapEnd, overlapStart) + 1;
      
      // Group by country + visa type for more granular tracking
      const key = `${visit.countryCode}-${visit.visaType}`;
      if (!breakdown[key]) {
        breakdown[key] = {
          countryCode: visit.countryCode,
          countryName: visit.countryName,
          days: 0,
          visits: [],
          visaType: visit.visaType,
        };
      }
      breakdown[key].days += days;
      breakdown[key].visits.push(visit);
    }
  });
  
  return Object.values(breakdown).sort((a, b) => b.days - a.days);
}

// Get exempt visits in Schengen countries (for display purposes)
export function getSchengenExemptVisits(visits: Visit[]): { countryCode: string; countryName: string; days: number; visaType: string; reason: string }[] {
  const today = getToday();
  const periodEndDate = today;
  const periodStartDate = subDays(today, 179);
  
  // Get visits in Schengen countries that DON'T count
  const exemptVisits = visits.filter(v => 
    isSchengenCountry(v.countryCode) && !countsAgainstSchengen(v.visaType)
  );
  
  return exemptVisits.map(visit => {
    // Use local midnight dates for calendar day comparison
    const entryDate = toLocalMidnight(visit.entryDate);
    const exitDate = visit.exitDate ? toLocalMidnight(visit.exitDate) : today;
    
    const overlapStart = isAfter(entryDate, periodStartDate) ? entryDate : periodStartDate;
    const overlapEnd = isBefore(exitDate, periodEndDate) ? exitDate : periodEndDate;
    
    let days = 0;
    if (isBefore(overlapStart, overlapEnd) || overlapStart.getTime() === overlapEnd.getTime()) {
      days = differenceInDays(overlapEnd, overlapStart) + 1;
    }
    
    return {
      countryCode: visit.countryCode,
      countryName: visit.countryName,
      days,
      visaType: visit.visaType,
      reason: 'National/Long-stay visa',
    };
  });
}

// Get visits that overlap with a specific date
export function getVisitsForDate(visits: Visit[], date: Date): Visit[] {
  const targetDate = startOfDay(date);
  
  return visits.filter(visit => {
    // Use local midnight dates for calendar day comparison
    const entryDate = toLocalMidnight(visit.entryDate);
    const exitDate = visit.exitDate ? toLocalMidnight(visit.exitDate) : getToday();
    
    return isWithinInterval(targetDate, { start: entryDate, end: exitDate }) ||
           targetDate.getTime() === entryDate.getTime() ||
           targetDate.getTime() === exitDate.getTime();
  });
}

// Generate calendar marks for react-native-calendars
export function generateCalendarMarks(visits: Visit[]): Record<string, any> {
  const marks: Record<string, any> = {};
  
  visits.forEach(visit => {
    // Use local midnight dates for calendar day marking
    const entryDate = toLocalMidnight(visit.entryDate);
    const exitDate = visit.exitDate ? toLocalMidnight(visit.exitDate) : getToday();
    
    const days = eachDayOfInterval({ start: entryDate, end: exitDate });
    
    days.forEach((day, index) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const isStart = index === 0;
      const isEnd = index === days.length - 1;
      
      if (!marks[dateStr]) {
        marks[dateStr] = {
          periods: [],
        };
      }
      
      marks[dateStr].periods.push({
        startingDay: isStart,
        endingDay: isEnd,
        color: isCurrentVisit(visit) ? '#34C759' : '#007AFF',
      });
    });
  });
  
  return marks;
}

// Format date for display
export function formatDate(date: string | Date | undefined | null, formatStr: string = 'MMM d, yyyy'): string {
  // Handle undefined, null, or empty string
  if (!date || (typeof date === 'string' && date.trim() === '')) {
    return '';
  }
  
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    
    // Check if the date is valid
    if (!d || isNaN(d.getTime())) {
      return '';
    }
    
    return format(d, formatStr);
  } catch (error) {
    console.warn('[formatDate] Invalid date:', date);
    return '';
  }
}

// Calculate tax residency days per country per year
export function calculateTaxDays(visits: Visit[], year: number): { countryCode: string; countryName: string; days: number; percentOfYear: number }[] {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const today = getToday();
  const effectiveEnd = isBefore(yearEnd, today) ? yearEnd : today;
  
  const breakdown: { [key: string]: { countryCode: string; countryName: string; days: number } } = {};
  
  visits.forEach(visit => {
    // Use local midnight dates for calendar day comparison
    const entryDate = toLocalMidnight(visit.entryDate);
    const exitDate = visit.exitDate ? toLocalMidnight(visit.exitDate) : today;
    
    // Check if visit overlaps with the year
    if (isAfter(entryDate, yearEnd) || isBefore(exitDate, yearStart)) {
      return;
    }
    
    const overlapStart = isAfter(entryDate, yearStart) ? entryDate : yearStart;
    const overlapEnd = isBefore(exitDate, effectiveEnd) ? exitDate : effectiveEnd;
    
    if (isBefore(overlapStart, overlapEnd) || overlapStart.getTime() === overlapEnd.getTime()) {
      const days = differenceInDays(overlapEnd, overlapStart) + 1;
      
      if (!breakdown[visit.countryCode]) {
        breakdown[visit.countryCode] = {
          countryCode: visit.countryCode,
          countryName: visit.countryName,
          days: 0,
        };
      }
      breakdown[visit.countryCode].days += days;
    }
  });
  
  const totalDaysInYear = isBefore(yearEnd, today) ? 365 : differenceInDays(today, yearStart) + 1;
  
  return Object.values(breakdown)
    .map(item => ({
      ...item,
      percentOfYear: (item.days / totalDaysInYear) * 100,
    }))
    .sort((a, b) => b.days - a.days);
}

// Get days by country for pie chart
export function getDaysByCountryForYear(visits: Visit[], year: number): { country: string; countryCode: string; days: number; color: string }[] {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#7BC225', '#E91E63',
    '#2196F3', '#00BCD4', '#8BC34A', '#FFC107', '#FF5722',
    '#9C27B0', '#3F51B5', '#009688', '#CDDC39', '#795548'
  ];
  
  const taxDays = calculateTaxDays(visits, year);
  
  return taxDays.map((item, index) => ({
    country: item.countryName,
    countryCode: item.countryCode,
    days: item.days,
    color: colors[index % colors.length],
  }));
}
