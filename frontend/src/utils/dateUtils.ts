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

// Calculate days spent in country (inclusive of entry day)
export function calculateDaysInCountry(entryDate: string, exitDate?: string): number {
  const entry = parseISO(entryDate);
  const exit = exitDate ? parseISO(exitDate) : new Date();
  return differenceInDays(exit, entry) + 1; // +1 to include entry day
}

// Check if visit is currently active
export function isCurrentVisit(visit: Visit): boolean {
  if (visit.exitDate) {
    return false;
  }
  return true;
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
export function calculateSchengenDays(visits: Visit[]): SchengenStatus {
  const today = startOfDay(new Date());
  const periodEndDate = today;
  const periodStartDate = subDays(today, 179); // 180-day rolling window
  
  // Filter Schengen visits
  const schengenVisits = visits.filter(v => isSchengenCountry(v.countryCode));
  
  let totalDays = 0;
  
  schengenVisits.forEach(visit => {
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

// Get Schengen visits breakdown by country
export function getSchengenBreakdown(visits: Visit[]): { countryCode: string; countryName: string; days: number; visits: Visit[] }[] {
  const today = startOfDay(new Date());
  const periodEndDate = today;
  const periodStartDate = subDays(today, 179);
  
  const schengenVisits = visits.filter(v => isSchengenCountry(v.countryCode));
  const breakdown: { [key: string]: { countryCode: string; countryName: string; days: number; visits: Visit[] } } = {};
  
  schengenVisits.forEach(visit => {
    const entryDate = startOfDay(parseISO(visit.entryDate));
    const exitDate = visit.exitDate ? startOfDay(parseISO(visit.exitDate)) : today;
    
    const overlapStart = isAfter(entryDate, periodStartDate) ? entryDate : periodStartDate;
    const overlapEnd = isBefore(exitDate, periodEndDate) ? exitDate : periodEndDate;
    
    if (isBefore(overlapStart, overlapEnd) || overlapStart.getTime() === overlapEnd.getTime()) {
      const days = differenceInDays(overlapEnd, overlapStart) + 1;
      
      if (!breakdown[visit.countryCode]) {
        breakdown[visit.countryCode] = {
          countryCode: visit.countryCode,
          countryName: visit.countryName,
          days: 0,
          visits: [],
        };
      }
      breakdown[visit.countryCode].days += days;
      breakdown[visit.countryCode].visits.push(visit);
    }
  });
  
  return Object.values(breakdown).sort((a, b) => b.days - a.days);
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
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
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
