import { Visit } from '../types';
import { COUNTRIES } from '../constants/countries';

export interface TravelStreak {
  currentStreak: number;
  longestStreak: number;
  totalTravelDays: number;
  lastTravelDate: string | null;
}

export interface YearComparison {
  year: number;
  totalVisits: number;
  countriesVisited: number;
  daysAbroad: number;
  newCountries: number;
}

export interface CountryHeatmapData {
  countryCode: string;
  countryName: string;
  flag: string;
  visitCount: number;
  totalDays: number;
  intensity: number; // 0-1 scale for heat map coloring
}

export interface GoalProgress {
  targetCountries: number;
  visitedCountries: number;
  remainingCountries: number;
  progressPercentage: number;
  countriesLeftList: { code: string; name: string; flag: string }[];
}

// Calculate travel streaks
export function calculateTravelStreaks(visits: Visit[]): TravelStreak {
  if (visits.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalTravelDays: 0,
      lastTravelDate: null,
    };
  }

  // Get all travel dates (entry and exit dates)
  const travelDates = new Set<string>();
  
  visits.forEach((visit) => {
    const entryDate = new Date(visit.entryDate);
    const exitDate = visit.exitDate ? new Date(visit.exitDate) : new Date();
    
    // Add all dates between entry and exit
    const currentDate = new Date(entryDate);
    while (currentDate <= exitDate) {
      travelDates.add(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  const sortedDates = Array.from(travelDates).sort();
  const totalTravelDays = sortedDates.length;
  const lastTravelDate = sortedDates[sortedDates.length - 1];

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Check if currently traveling
  if (travelDates.has(today)) {
    currentStreak = 1;
    // Count backwards
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);
    while (travelDates.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (travelDates.has(yesterdayStr)) {
    // Streak ended yesterday
    currentStreak = 1;
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 2);
    while (travelDates.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    totalTravelDays,
    lastTravelDate,
  };
}

// Calculate country heat map data
export function calculateCountryHeatmap(visits: Visit[]): CountryHeatmapData[] {
  const countryStats: Record<string, { visitCount: number; totalDays: number }> = {};

  visits.forEach((visit) => {
    const code = visit.countryCode;
    if (!countryStats[code]) {
      countryStats[code] = { visitCount: 0, totalDays: 0 };
    }

    countryStats[code].visitCount++;

    const entryDate = new Date(visit.entryDate);
    const exitDate = visit.exitDate ? new Date(visit.exitDate) : new Date();
    const days = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    countryStats[code].totalDays += days;
  });

  // Find max values for intensity calculation
  const maxDays = Math.max(...Object.values(countryStats).map((s) => s.totalDays), 1);

  // Convert to array and calculate intensity
  return Object.entries(countryStats)
    .map(([code, stats]) => {
      const country = COUNTRIES.find((c) => c.code === code);
      return {
        countryCode: code,
        countryName: country?.name || code,
        flag: country?.flag || '',
        visitCount: stats.visitCount,
        totalDays: stats.totalDays,
        intensity: stats.totalDays / maxDays,
      };
    })
    .sort((a, b) => b.totalDays - a.totalDays);
}

// Calculate year-over-year comparisons
export function calculateYearComparisons(visits: Visit[], years: number[]): YearComparison[] {
  const allVisitedCountries = new Set<string>();
  
  return years.map((year) => {
    const yearVisits = visits.filter((v) => {
      const visitYear = new Date(v.entryDate).getFullYear();
      return visitYear === year;
    });

    const countriesThisYear = new Set(yearVisits.map((v) => v.countryCode));
    
    // Calculate new countries (not visited in previous years)
    const newCountries = Array.from(countriesThisYear).filter(
      (code) => !allVisitedCountries.has(code)
    ).length;

    // Add this year's countries to all visited
    countriesThisYear.forEach((code) => allVisitedCountries.add(code));

    // Calculate total days abroad for this year
    let daysAbroad = 0;
    yearVisits.forEach((visit) => {
      const entryDate = new Date(visit.entryDate);
      const exitDate = visit.exitDate ? new Date(visit.exitDate) : new Date();
      
      // Clamp dates to the year
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31);
      
      const effectiveStart = entryDate < yearStart ? yearStart : entryDate;
      const effectiveEnd = exitDate > yearEnd ? yearEnd : exitDate;
      
      if (effectiveStart <= effectiveEnd) {
        daysAbroad += Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
    });

    return {
      year,
      totalVisits: yearVisits.length,
      countriesVisited: countriesThisYear.size,
      daysAbroad,
      newCountries,
    };
  }).reverse(); // Most recent first
}

// Calculate goal progress
export function calculateGoalProgress(visits: Visit[], targetCountries: number): GoalProgress {
  const visitedCountryCodes = new Set(visits.map((v) => v.countryCode));
  const visitedCountries = visitedCountryCodes.size;
  const remainingCountries = Math.max(0, targetCountries - visitedCountries);
  const progressPercentage = Math.min(100, (visitedCountries / targetCountries) * 100);

  // Get list of countries not yet visited
  const countriesLeftList = COUNTRIES
    .filter((c) => !visitedCountryCodes.has(c.code))
    .slice(0, 50) // Limit to 50 for performance
    .map((c) => ({
      code: c.code,
      name: c.name,
      flag: c.flag,
    }));

  return {
    targetCountries,
    visitedCountries,
    remainingCountries,
    progressPercentage,
    countriesLeftList,
  };
}

// Get years with visits
export function getYearsWithVisits(visits: Visit[]): number[] {
  const years = new Set<number>();
  const currentYear = new Date().getFullYear();
  
  visits.forEach((v) => {
    years.add(new Date(v.entryDate).getFullYear());
  });
  
  // Always include current year
  years.add(currentYear);
  
  // Add last 5 years for comparison
  for (let i = 0; i < 5; i++) {
    years.add(currentYear - i);
  }
  
  return Array.from(years).sort((a, b) => b - a);
}
