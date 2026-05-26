/**
 * Unit Tests for Schengen Engine
 * 
 * Test scenarios based on official European Commission short-stay calculator
 * Reference: https://ec.europa.eu/home-affairs/content/visa-calculator_en
 */

import {
  buildSchengenStateArray,
  calculateSchengenDaysOnDate,
  validateSchengenCompliance,
  calculateMaxStay,
  calculateLegalFullReEntryDate,
  detectSchengenResets,
  calculateSchengenStatusExtended,
  isSchengenCountry,
  countsAgainstSchengen,
  visitCountsForSchengen,
  dateToIndex,
  indexToDate,
} from '../schengenEngine';
import { Visit, Passport } from '../../types';
import { addDays, subDays, format, differenceInDays } from 'date-fns';

// Helper to create a visit
const createVisit = (
  countryCode: string,
  entryDate: string,
  exitDate: string | null,
  visaType: string = 'Tourist',
  passportId: string = 'passport-1'
): Visit => ({
  id: `visit-${Math.random().toString(36).substr(2, 9)}`,
  countryCode,
  countryName: countryCode,
  entryDate,
  exitDate: exitDate || undefined,
  visaType,
  passportId,
  allowedDays: 90,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Helper to create a passport
const createPassport = (countryCode: string, id: string = 'passport-1'): Passport => ({
  id,
  type: 'primary',
  countryCode,
  countryName: countryCode,
  passportNumber: 'ABC123',
  issueDate: '2020-01-01',
  expiryDate: '2030-12-31',
});

describe('Schengen Engine - Core Functions', () => {
  describe('isSchengenCountry', () => {
    it('should return true for Schengen countries', () => {
      expect(isSchengenCountry('DE')).toBe(true); // Germany
      expect(isSchengenCountry('FR')).toBe(true); // France
      expect(isSchengenCountry('ES')).toBe(true); // Spain
      expect(isSchengenCountry('IT')).toBe(true); // Italy
      expect(isSchengenCountry('CH')).toBe(true); // Switzerland
    });

    it('should return false for non-Schengen countries', () => {
      expect(isSchengenCountry('GB')).toBe(false); // UK
      expect(isSchengenCountry('IE')).toBe(false); // Ireland
      expect(isSchengenCountry('CY')).toBe(false); // Cyprus
      expect(isSchengenCountry('US')).toBe(false); // USA
      expect(isSchengenCountry('JP')).toBe(false); // Japan
    });
  });

  describe('countsAgainstSchengen', () => {
    it('should return true for tourist/short-stay visas', () => {
      expect(countsAgainstSchengen('Tourist')).toBe(true);
      expect(countsAgainstSchengen('Visa Free')).toBe(true);
      expect(countsAgainstSchengen('Schengen C Visa')).toBe(true);
      expect(countsAgainstSchengen('Short Stay')).toBe(true);
    });

    it('should return false for long-stay/national visas', () => {
      expect(countsAgainstSchengen('National D Visa')).toBe(false);
      expect(countsAgainstSchengen('Digital Nomad Visa')).toBe(false);
      expect(countsAgainstSchengen('Work Permit')).toBe(false);
      expect(countsAgainstSchengen('Residence Permit')).toBe(false);
      expect(countsAgainstSchengen('EU Blue Card')).toBe(false);
      expect(countsAgainstSchengen('Student Visa')).toBe(false);
      expect(countsAgainstSchengen('EU Citizen')).toBe(false);
    });
  });
});

describe('Schengen Engine - Date Array Mapping', () => {
  describe('buildSchengenStateArray', () => {
    it('should create correct array for a single visit', () => {
      const visits = [
        createVisit('DE', '2025-01-01', '2025-01-10'),
      ];
      const passports = [createPassport('US')]; // Non-EU passport
      
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-15');
      
      const array = buildSchengenStateArray(visits, passports, startDate, endDate);
      
      // Days 0-9 (Jan 1-10) should be true, days 10-14 should be false
      expect(array[0]).toBe(true);  // Jan 1
      expect(array[9]).toBe(true);  // Jan 10
      expect(array[10]).toBe(false); // Jan 11
      expect(array[14]).toBe(false); // Jan 15
    });

    it('should handle overlapping visits with logical OR', () => {
      const visits = [
        createVisit('DE', '2025-01-01', '2025-01-10'),
        createVisit('FR', '2025-01-05', '2025-01-15'),
      ];
      const passports = [createPassport('US')];
      
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-20');
      
      const array = buildSchengenStateArray(visits, passports, startDate, endDate);
      
      // Days should be counted only once due to OR
      let totalTrueDays = array.filter(v => v).length;
      expect(totalTrueDays).toBe(15); // Jan 1-15
    });

    it('should exclude visits with exempt visa types', () => {
      const visits = [
        createVisit('DE', '2025-01-01', '2025-01-30', 'Digital Nomad Visa'),
      ];
      const passports = [createPassport('US')];
      
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      const array = buildSchengenStateArray(visits, passports, startDate, endDate);
      
      // All days should be false because Digital Nomad Visa is exempt
      expect(array.every(v => v === false)).toBe(true);
    });

    it('should exclude visits with EU passport', () => {
      const visits = [
        createVisit('DE', '2025-01-01', '2025-01-30', 'Tourist', 'eu-passport'),
      ];
      const passports = [createPassport('DE', 'eu-passport')]; // German passport
      
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      const array = buildSchengenStateArray(visits, passports, startDate, endDate);
      
      // All days should be false because EU passport is exempt
      expect(array.every(v => v === false)).toBe(true);
    });
  });
});

describe('Schengen Engine - Rolling Sum', () => {
  describe('calculateSchengenDaysOnDate', () => {
    it('should calculate correct sum for simple case', () => {
      // 30 days of Schengen travel
      const array = new Array(200).fill(false);
      for (let i = 100; i < 130; i++) {
        array[i] = true;
      }
      
      const arrayStartDate = new Date('2025-01-01');
      const targetDate = addDays(arrayStartDate, 150); // 50 days after trip ended
      
      const sum = calculateSchengenDaysOnDate(targetDate, array, arrayStartDate);
      expect(sum).toBe(30);
    });

    it('should return 0 when no Schengen days in window', () => {
      const array = new Array(400).fill(false);
      const arrayStartDate = new Date('2024-01-01');
      const targetDate = new Date('2025-01-15');
      
      const sum = calculateSchengenDaysOnDate(targetDate, array, arrayStartDate);
      expect(sum).toBe(0);
    });

    it('should count only days within 180-day window', () => {
      const array = new Array(400).fill(false);
      // Mark days 0-30 as Schengen (31 days)
      for (let i = 0; i < 31; i++) {
        array[i] = true;
      }
      
      const arrayStartDate = new Date('2024-01-01');
      
      // Check on day 100 - within 180 window, should count
      const sumDay100 = calculateSchengenDaysOnDate(
        addDays(arrayStartDate, 100),
        array,
        arrayStartDate
      );
      expect(sumDay100).toBe(31);
      
      // Check on day 250 - outside 180 window from those days
      const sumDay250 = calculateSchengenDaysOnDate(
        addDays(arrayStartDate, 250),
        array,
        arrayStartDate
      );
      expect(sumDay250).toBe(0);
    });
  });
});

describe('Schengen Engine - Validation', () => {
  describe('validateSchengenCompliance', () => {
    it('should return valid for stay under 90 days', () => {
      const today = new Date();
      const visits = [
        createVisit('DE', format(subDays(today, 30), 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd')),
      ];
      const passports = [createPassport('US')];
      
      const result = validateSchengenCompliance(visits, passports);
      
      expect(result.valid).toBe(true);
      expect(result.daysUsed).toBeLessThanOrEqual(90);
      expect(result.overstayDate).toBeUndefined();
    });

    it('should return invalid for stay over 90 days', () => {
      const today = new Date();
      const visits = [
        createVisit('DE', format(subDays(today, 100), 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd')),
      ];
      const passports = [createPassport('US')];
      
      const result = validateSchengenCompliance(visits, passports);
      
      expect(result.valid).toBe(false);
      expect(result.daysUsed).toBeGreaterThan(90);
      expect(result.overstayDate).toBeDefined();
      expect(result.overstayAmount).toBeGreaterThan(0);
    });

    it('should detect overstay for proposed trip', () => {
      const today = new Date();
      const visits = [
        createVisit('DE', format(subDays(today, 80), 'yyyy-MM-dd'), format(subDays(today, 1), 'yyyy-MM-dd')),
      ];
      const passports = [createPassport('US')];
      
      // Propose a 20-day trip starting tomorrow - would exceed 90 days
      const proposedTrip = {
        start: addDays(today, 1),
        end: addDays(today, 20),
      };
      
      const result = validateSchengenCompliance(visits, passports, proposedTrip);
      
      expect(result.valid).toBe(false);
    });
  });
});

describe('Schengen Engine - Forward Simulation', () => {
  describe('calculateMaxStay', () => {
    it('should return 90 for fresh entry with no history', () => {
      const visits: Visit[] = [];
      const passports = [createPassport('US')];
      const entryDate = new Date();
      
      const maxStay = calculateMaxStay(entryDate, visits, passports);
      
      expect(maxStay).toBe(90);
    });

    it('should return reduced days when some days already used', () => {
      const today = new Date();
      const visits = [
        createVisit('DE', format(subDays(today, 50), 'yyyy-MM-dd'), format(subDays(today, 21), 'yyyy-MM-dd')),
      ];
      const passports = [createPassport('US')];
      
      const maxStay = calculateMaxStay(today, visits, passports);
      
      // Used 30 days in past, should have ~60 days remaining
      expect(maxStay).toBeLessThanOrEqual(60);
      expect(maxStay).toBeGreaterThan(50);
    });
  });

  describe('calculateLegalFullReEntryDate', () => {
    it('should return today if 90 days available', () => {
      const visits: Visit[] = [];
      const passports = [createPassport('US')];
      const today = new Date();
      
      const reEntryDate = calculateLegalFullReEntryDate(visits, passports, today);
      
      // Should be today or within a day due to timing
      expect(differenceInDays(reEntryDate, today)).toBeLessThanOrEqual(1);
    });

    it('should return future date if days are exhausted', () => {
      const today = new Date();
      // Create visit that uses most of the 90 days recently
      const visits = [
        createVisit('DE', format(subDays(today, 85), 'yyyy-MM-dd'), format(subDays(today, 5), 'yyyy-MM-dd')),
      ];
      const passports = [createPassport('US')];
      
      const reEntryDate = calculateLegalFullReEntryDate(visits, passports, today);
      
      // Should be at least some days in the future
      expect(differenceInDays(reEntryDate, today)).toBeGreaterThan(0);
    });
  });
});

describe('Schengen Engine - Gap Detection', () => {
  describe('detectSchengenResets', () => {
    it('should detect soft reset (90+ day gap)', () => {
      const today = new Date();
      const visits = [
        createVisit('DE', format(subDays(today, 200), 'yyyy-MM-dd'), format(subDays(today, 180), 'yyyy-MM-dd')),
      ];
      const passports = [createPassport('US')];
      
      const resets = detectSchengenResets(visits, passports);
      
      expect(resets.hasSoftReset).toBe(true);
      expect(resets.gapLength).toBeGreaterThanOrEqual(90);
    });

    it('should detect full reset (180+ day gap)', () => {
      const today = new Date();
      const visits = [
        createVisit('DE', format(subDays(today, 300), 'yyyy-MM-dd'), format(subDays(today, 280), 'yyyy-MM-dd')),
      ];
      const passports = [createPassport('US')];
      
      const resets = detectSchengenResets(visits, passports);
      
      expect(resets.hasFullReset).toBe(true);
      expect(resets.gapLength).toBeGreaterThanOrEqual(180);
    });
  });
});

describe('Schengen Engine - Official Calculator Scenarios', () => {
  // These test cases are based on known scenarios from the EC calculator
  
  it('Scenario 1: Simple 90-day stay', () => {
    const today = new Date('2025-06-01');
    const visits = [
      createVisit('DE', '2025-03-01', '2025-05-29'), // 90 days exactly
    ];
    const passports = [createPassport('US')];
    
    const status = calculateSchengenStatusExtended(visits, passports);
    
    expect(status.daysUsed).toBe(90);
    expect(status.daysRemaining).toBe(0);
    expect(status.valid).toBe(true);
  });

  it('Scenario 2: Split stays within 180 days', () => {
    const today = new Date('2025-06-01');
    const visits = [
      createVisit('FR', '2025-01-15', '2025-02-14'), // 31 days
      createVisit('ES', '2025-03-01', '2025-03-30'), // 30 days
      createVisit('IT', '2025-05-01', '2025-05-15'), // 15 days
    ];
    const passports = [createPassport('US')];
    
    // Total: 76 days
    const status = calculateSchengenStatusExtended(visits, passports);
    
    expect(status.daysUsed).toBeLessThanOrEqual(90);
    expect(status.valid).toBe(true);
  });

  it('Scenario 3: EU passport holder is exempt', () => {
    const today = new Date('2025-06-01');
    const visits = [
      createVisit('DE', '2024-06-01', '2025-05-30', 'Tourist', 'eu-passport'), // 365 days!
    ];
    const passports = [createPassport('FR', 'eu-passport')]; // French passport
    
    const status = calculateSchengenStatusExtended(visits, passports);
    
    // EU citizen is exempt - 0 days counted
    expect(status.daysUsed).toBe(0);
    expect(status.valid).toBe(true);
  });

  it('Scenario 4: National D Visa is exempt', () => {
    const today = new Date('2025-06-01');
    const visits = [
      createVisit('DE', '2024-06-01', '2025-05-30', 'National D Visa'), // 365 days
    ];
    const passports = [createPassport('US')];
    
    const status = calculateSchengenStatusExtended(visits, passports);
    
    // National D Visa is exempt
    expect(status.daysUsed).toBe(0);
    expect(status.valid).toBe(true);
  });

  it('Scenario 5: Travel to non-Schengen EU does not count', () => {
    const today = new Date('2025-06-01');
    const visits = [
      createVisit('DE', '2025-03-01', '2025-03-30'), // 30 days Schengen
      createVisit('IE', '2025-04-01', '2025-04-30'), // 30 days Ireland (non-Schengen)
      createVisit('FR', '2025-05-01', '2025-05-15'), // 15 days Schengen
    ];
    const passports = [createPassport('US')];
    
    const status = calculateSchengenStatusExtended(visits, passports);
    
    // Only DE + FR should count: 30 + 15 = 45 days
    expect(status.daysUsed).toBe(45);
    expect(status.valid).toBe(true);
  });
});
