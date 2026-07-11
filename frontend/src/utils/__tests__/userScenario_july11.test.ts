/**
 * Reproduction test for user-reported issue (July 11 "fresh 90 days" report)
 *
 * User report: "If I have 90 new days when I land today it should count
 * today as day 1 with 89 remaining" — but app shows 82 used / 8 remaining.
 *
 * Hypothesis (from prior diagnosis): an OPEN visit (no exit date) to Portugal
 * starting ~April 21, 2026 is silently accumulating days through today.
 */

import { calculateSchengenStatusExtended } from '../schengenEngine';
import { Visit, Passport } from '../../types';

const createVisit = (
  countryCode: string,
  entryDate: string,
  exitDate: string | null,
  visaType: string = 'Tourist'
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

describe('User scenario: July 11, 2026 landing in Portugal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 11, 12, 0, 0)); // July 11, 2026 noon local
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('SCENARIO A (user data as-is): open Portugal visit since Apr 21 → 82 used / 8 remaining', () => {
    const visits = [createVisit('PT', '2026-04-21', null)]; // no exit date!
    const status = calculateSchengenStatusExtended(visits, passports);
    // Apr 21 → Jul 11 inclusive = 82 days
    expect(status.daysUsed).toBe(82);
    expect(status.daysRemaining).toBe(8);
  });

  test('SCENARIO B (clean data): single visit landing today → day 1 with 89 remaining', () => {
    const visits = [createVisit('PT', '2026-07-11', null)];
    const status = calculateSchengenStatusExtended(visits, passports);
    expect(status.daysUsed).toBe(1);   // today counts as day 1 ✓
    expect(status.daysRemaining).toBe(89); // 89 remaining ✓
  });

  test('SCENARIO C (old visit properly closed): Apr 21–28 closed + landing today → 9 used / 81 remaining', () => {
    const visits = [
      createVisit('PT', '2026-04-21', '2026-04-28'), // 8 days, still inside 180-day window
      createVisit('PT', '2026-07-11', null),          // landing today
    ];
    const status = calculateSchengenStatusExtended(visits, passports);
    expect(status.daysUsed).toBe(9);
    expect(status.daysRemaining).toBe(81);
  });

  test('SCENARIO D (true full reset): last visit ended >180 days ago → landing today is day 1 / 89 remaining', () => {
    const visits = [
      createVisit('PT', '2025-10-01', '2025-12-15'), // ended >180 days before Jul 11 2026
      createVisit('PT', '2026-07-11', null),
    ];
    const status = calculateSchengenStatusExtended(visits, passports);
    expect(status.daysUsed).toBe(1);
    expect(status.daysRemaining).toBe(89);
  });
});
