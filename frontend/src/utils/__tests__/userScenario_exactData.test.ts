/**
 * EXACT USER DATA verification — from user's screenshots:
 *   Visit 1: Portugal, Jan 17 2026 → Mar 9 2026 (closed)
 *   Visit 2: Portugal, Mar 14 2026 → Apr 11 2026 (closed)
 *   User lands in Portugal on July 11, 2026.
 */

import { calculateSchengenStatusExtended } from '../schengenEngine';
import { Visit, Passport } from '../../types';
import { format } from 'date-fns';

const createVisit = (
  countryCode: string,
  entryDate: string,
  exitDate: string | null,
  visaType: string = 'Schengen C (Short Stay)'
): Visit => ({
  id: `visit-${Math.random().toString(36).substr(2, 9)}`,
  countryCode,
  countryName: countryCode,
  entryDate,
  exitDate: exitDate || undefined,
  visaType,
  passportId: 'passport-1',
  allowedDays: 90,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as Visit);

const passports: Passport[] = [{
  id: 'passport-1',
  type: 'primary',
  countryCode: 'US',
  countryName: 'United States',
} as Passport];

describe('EXACT user data: two closed Portugal visits, landing July 11 2026', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 11, 12, 0, 0)); // July 11, 2026
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const pastVisits = [
    createVisit('PT', '2026-01-17', '2026-03-09'), // 52 days
    createVisit('PT', '2026-03-14', '2026-04-11'), // 29 days
  ];

  test('Full status dump with landing visit added today', () => {
    const visits = [...pastVisits, createVisit('PT', '2026-07-11', null)];
    const s = calculateSchengenStatusExtended(visits, passports);
    console.log('=== WITH July 11 landing visit ===');
    console.log('daysUsed:', s.daysUsed);
    console.log('daysRemaining:', s.daysRemaining);
    console.log('maxStayFromToday:', s.maxStayFromToday);
    console.log('legalFullReEntryDate:', format(s.legalFullReEntryDate, 'yyyy-MM-dd'));
    console.log('valid:', s.valid);

    expect(s.daysUsed).toBe(82);        // 52 + 29 + 1 (today)
    expect(s.daysRemaining).toBe(8);    // naive backward window: 90 - 82
    expect(s.maxStayFromToday).toBe(90); // forward simulation: FULL 90 days OK!
    expect(format(s.legalFullReEntryDate, 'yyyy-MM-dd')).toBe('2026-07-11'); // TODAY
  });

  test('Status WITHOUT landing visit (as it looked before landing)', () => {
    const s = calculateSchengenStatusExtended(pastVisits, passports);
    console.log('=== WITHOUT landing visit ===');
    console.log('daysUsed:', s.daysUsed);
    console.log('daysRemaining:', s.daysRemaining);
    console.log('maxStayFromToday:', s.maxStayFromToday);
    console.log('legalFullReEntryDate:', format(s.legalFullReEntryDate, 'yyyy-MM-dd'));

    expect(s.daysUsed).toBe(81);
    expect(s.maxStayFromToday).toBe(90);
    expect(format(s.legalFullReEntryDate, 'yyyy-MM-dd')).toBe('2026-07-11');
  });

  test('Widget correctly told user July 11 = fresh 90-day entry date (checked from June 20)', () => {
    jest.setSystemTime(new Date(2026, 5, 20, 12, 0, 0)); // June 20, 2026
    const s = calculateSchengenStatusExtended(pastVisits, passports);
    console.log('=== As of June 20 ===');
    console.log('legalFullReEntryDate:', format(s.legalFullReEntryDate, 'yyyy-MM-dd'));
    expect(format(s.legalFullReEntryDate, 'yyyy-MM-dd')).toBe('2026-07-11');
  });
});
