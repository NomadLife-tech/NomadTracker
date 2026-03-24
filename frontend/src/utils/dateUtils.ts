import { differenceInDays, parseISO, isAfter, isBefore, isWithinInterval, format, subDays, addDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { Visit, VisaStatus, SchengenStatus } from '../types';

// Schengen countries
export const SCHENGEN_COUNTRIES = [
  'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
  'PT', 'SK', 'SI', 'ES', 'SE', 'CH', 'HR', 'BG'
];

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
export function calculateDaysInCountry(entryDate: string, exitDate?: string): number {
  const entry = parseISO(entryDate);
  const exit = exitDate ? parseISO(exitDate) : new Date();
  return differenceInDays(exit, entry) + 1; // +1 to include entry day
}

// Check if visit is currently active (user is currently in the country)
export function isCurrentVisit(visit: Visit): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Parse entry date - extract just the date part to avoid timezone issues
  const entryParts = visit.entryDate.split('T')[0].split('-');
  const entryDate = new Date(
    parseInt(entryParts[0]), 
    parseInt(entryParts[1]) - 1, 
    parseInt(entryParts[2])
  );
  
  console.log(`isCurrentVisit check for ${visit.countryCode}:`, {
    today: today.toDateString(),
    entryDate: entryDate.toDateString(),
    exitDate: visit.exitDate,
    entryDateRaw: visit.entryDate,
  });
  
  // Entry date must be today or in the past
  if (entryDate > today) {
    console.log('  -> FALSE: entry date is in future');
    return false;
  }
  
  // If no exit date, the visit is ongoing
  if (!visit.exitDate) {
    console.log('  -> TRUE: no exit date, ongoing');
    return true;
  }
  
  // Parse exit date - extract just the date part
  const exitParts = visit.exitDate.split('T')[0].split('-');
  const exitDate = new Date(
    parseInt(exitParts[0]), 
    parseInt(exitParts[1]) - 1, 
    parseInt(exitParts[2])
  );
  
  const isActive = exitDate >= today;
  console.log(`  -> ${isActive}: exitDate ${exitDate.toDateString()} >= today ${today.toDateString()}`);
  return isActive;
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
// Now based on VISA TYPE, not just country
export function calculateSchengenDays(visits: Visit[]): SchengenStatus {
  const today = startOfDay(new Date());
  const periodEndDate = today;
  const periodStartDate = subDays(today, 179); // 180-day rolling window
  
  // Filter visits that:
  // 1. Are in Schengen countries AND
  // 2. Have a visa type that counts against Schengen 90/180
  const countingVisits = visits.filter(v => 
    isSchengenCountry(v.countryCode) && countsAgainstSchengen(v.visaType)
  );
  
  let totalDays = 0;
  
  countingVisits.forEach(visit => {
    const entryDate = startOfDay(parseISO(visit.entryDate));
    const exitDate = visit.exitDate ? startOfDay(parseISO(visit.exitDate)) : today;
    
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
export function getSchengenBreakdown(visits: Visit[]): { countryCode: string; countryName: string; days: number; visits: Visit[]; visaType: string }[] {
  const today = startOfDay(new Date());
  const periodEndDate = today;
  const periodStartDate = subDays(today, 179);
  
  // Only include visits that count against Schengen
  const countingVisits = visits.filter(v => 
    isSchengenCountry(v.countryCode) && countsAgainstSchengen(v.visaType)
  );
  
  const breakdown: { [key: string]: { countryCode: string; countryName: string; days: number; visits: Visit[]; visaType: string } } = {};
  
  countingVisits.forEach(visit => {
    const entryDate = startOfDay(parseISO(visit.entryDate));
    const exitDate = visit.exitDate ? startOfDay(parseISO(visit.exitDate)) : today;
    
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
  const today = startOfDay(new Date());
  const periodEndDate = today;
  const periodStartDate = subDays(today, 179);
  
  // Get visits in Schengen countries that DON'T count
  const exemptVisits = visits.filter(v => 
    isSchengenCountry(v.countryCode) && !countsAgainstSchengen(v.visaType)
  );
  
  return exemptVisits.map(visit => {
    const entryDate = startOfDay(parseISO(visit.entryDate));
    const exitDate = visit.exitDate ? startOfDay(parseISO(visit.exitDate)) : today;
    
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
    const entryDate = startOfDay(parseISO(visit.entryDate));
    const exitDate = visit.exitDate ? startOfDay(parseISO(visit.exitDate)) : new Date();
    
    return isWithinInterval(targetDate, { start: entryDate, end: exitDate }) ||
           targetDate.getTime() === entryDate.getTime() ||
           targetDate.getTime() === exitDate.getTime();
  });
}

// Generate calendar marks for react-native-calendars
export function generateCalendarMarks(visits: Visit[]): Record<string, any> {
  const marks: Record<string, any> = {};
  
  visits.forEach(visit => {
    const entryDate = parseISO(visit.entryDate);
    const exitDate = visit.exitDate ? parseISO(visit.exitDate) : new Date();
    
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
  const today = new Date();
  const effectiveEnd = isBefore(yearEnd, today) ? yearEnd : today;
  
  const breakdown: { [key: string]: { countryCode: string; countryName: string; days: number } } = {};
  
  visits.forEach(visit => {
    const entryDate = parseISO(visit.entryDate);
    const exitDate = visit.exitDate ? parseISO(visit.exitDate) : today;
    
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
