import {
  isSchengenCountry,
  countsAgainstSchengen,
  calculateDaysInCountry,
  isCurrentVisit,
  getVisaStatus,
  calculateSchengenDays,
  formatDate,
} from '../src/utils/dateUtils';
import { Visit } from '../src/types';

// Helper to create a Visit object for testing
const createVisit = (overrides: Partial<Visit> = {}): Visit => ({
  id: '1',
  countryCode: 'DE',
  countryName: 'Germany',
  entryDate: '2024-01-01',
  visaType: 'Tourist',
  allowedDays: 90,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('dateUtils', () => {
  describe('isSchengenCountry', () => {
    it('should return true for Schengen countries', () => {
      expect(isSchengenCountry('DE')).toBe(true);
      expect(isSchengenCountry('FR')).toBe(true);
      expect(isSchengenCountry('ES')).toBe(true);
      expect(isSchengenCountry('IT')).toBe(true);
    });

    it('should return false for non-Schengen countries', () => {
      expect(isSchengenCountry('US')).toBe(false);
      expect(isSchengenCountry('GB')).toBe(false);
      expect(isSchengenCountry('TR')).toBe(false);
    });

    it('should include new Schengen members', () => {
      expect(isSchengenCountry('HR')).toBe(true);
      expect(isSchengenCountry('BG')).toBe(true);
    });
  });

  describe('countsAgainstSchengen', () => {
    it('should return true for tourist visas', () => {
      expect(countsAgainstSchengen('Tourist Visa')).toBe(true);
      expect(countsAgainstSchengen('Schengen C Visa')).toBe(true);
      expect(countsAgainstSchengen('Visa Free')).toBe(true);
    });

    it('should return false for digital nomad visas', () => {
      expect(countsAgainstSchengen('Digital Nomad Visa')).toBe(false);
      expect(countsAgainstSchengen('Spain Digital Nomad')).toBe(false);
    });

    it('should return false for National D visas', () => {
      expect(countsAgainstSchengen('National D Visa')).toBe(false);
      expect(countsAgainstSchengen('D Visa')).toBe(false);
    });

    it('should return false for work permits', () => {
      expect(countsAgainstSchengen('Work Permit')).toBe(false);
      expect(countsAgainstSchengen('EU Blue Card')).toBe(false);
    });
  });

  describe('calculateDaysInCountry', () => {
    it('should calculate days correctly for completed visits', () => {
      expect(calculateDaysInCountry('2024-01-01', '2024-01-01')).toBe(1);
      expect(calculateDaysInCountry('2024-01-01', '2024-01-10')).toBe(10);
      expect(calculateDaysInCountry('2024-01-01', '2024-01-31')).toBe(31);
    });
  });

  describe('isCurrentVisit', () => {
    it('should return true for visits without exit date', () => {
      const visit = createVisit({ exitDate: undefined });
      expect(isCurrentVisit(visit)).toBe(true);
    });

    it('should return false for visits with exit date', () => {
      const visit = createVisit({ exitDate: '2024-01-15' });
      expect(isCurrentVisit(visit)).toBe(false);
    });
  });

  describe('getVisaStatus', () => {
    it('should calculate correct visa status for completed visit', () => {
      const visit = createVisit({
        entryDate: '2024-01-01',
        exitDate: '2024-01-30',
        allowedDays: 90,
      });

      const status = getVisaStatus(visit);
      expect(status.daysUsed).toBe(30);
      expect(status.daysRemaining).toBe(60);
      expect(status.isActive).toBe(false);
      expect(status.isOverstay).toBe(false);
    });

    it('should detect overstay', () => {
      const visit = createVisit({
        entryDate: '2024-01-01',
        exitDate: '2024-05-01',
        allowedDays: 90,
      });

      const status = getVisaStatus(visit);
      expect(status.isOverstay).toBe(true);
      expect(status.daysRemaining).toBe(0);
    });
  });

  describe('calculateSchengenDays', () => {
    it('should calculate days for counting visa types', () => {
      const today = new Date();
      const fifteenDaysAgo = new Date(today);
      fifteenDaysAgo.setDate(today.getDate() - 15);

      const visits = [
        createVisit({
          countryCode: 'DE',
          entryDate: fifteenDaysAgo.toISOString().split('T')[0],
          visaType: 'Tourist Visa',
          exitDate: undefined,
        }),
      ];

      const status = calculateSchengenDays(visits);
      expect(status.daysUsedInPeriod).toBe(16);
      expect(status.daysRemainingInPeriod).toBe(74);
    });

    it('should NOT count digital nomad visa days', () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const visits = [
        createVisit({
          countryCode: 'ES',
          entryDate: thirtyDaysAgo.toISOString().split('T')[0],
          visaType: 'Digital Nomad Visa',
          allowedDays: 365,
          exitDate: undefined,
        }),
      ];

      const status = calculateSchengenDays(visits);
      expect(status.daysUsedInPeriod).toBe(0);
      expect(status.daysRemainingInPeriod).toBe(90);
    });

    it('should ignore non-Schengen countries', () => {
      const today = new Date();
      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(today.getDate() - 10);

      const visits = [
        createVisit({
          countryCode: 'GB',
          countryName: 'United Kingdom',
          entryDate: tenDaysAgo.toISOString().split('T')[0],
          visaType: 'Tourist Visa',
          exitDate: undefined,
        }),
      ];

      const status = calculateSchengenDays(visits);
      expect(status.daysUsedInPeriod).toBe(0);
      expect(status.daysRemainingInPeriod).toBe(90);
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      expect(formatDate('2024-01-15', 'MMM d, yyyy')).toBe('Jan 15, 2024');
      expect(formatDate('2024-12-25', 'yyyy-MM-dd')).toBe('2024-12-25');
    });
  });
});
