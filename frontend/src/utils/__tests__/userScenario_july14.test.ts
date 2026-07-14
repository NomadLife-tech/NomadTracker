/**
 * Reproduction test for user-reported issue (July 14, 2026 display double-count).
 *
 * User report: "I arrived in Portugal on the 11th, today is the 14th, so I have
 * been here 4 days from a calendar perspective, therefore I should have 86 days
 * remaining not 87 as shown in both the mini map and the Schengen calculator."
 *
 * Diagnosis: `calculateMaxStay` counts today (dayOffset = 0) even when today is
 * already an active Schengen day (from an open-ended visit), which double-counts
 * today across "Days Used" (which includes today) and "You Can Stay" (which
 * should show days remaining AFTER today).
 *
 * Fix location: UI display layer only (index.tsx and MiniMapCard.tsx). The
 * engine's `calculateMaxStay` returns the raw forward-projection count (87) and
 * the UI subtracts 1 when the user is currently inside Schengen on a counting
 * visit — yielding the user-facing "You Can Stay = 86".
 *
 * This test pins the ENGINE contract (unchanged: returns 87) so any future
 * engine refactor cannot accidentally regress the primitive that the UI relies on.
 */

import { calculateSchengenStatusExtended } from '../schengenEngine';
import { Visit, Passport } from '../../types';
import { addDays, format } from 'date-fns';

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

describe('User scenario: July 14, 2026 — display "You Can Stay" off-by-one', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 14, 12, 0, 0)); // July 14, 2026 noon local
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('single Portugal visit Jul 11 open → 4 days used, engine max stay = 87, display should be 86', () => {
    const visits = [createVisit('PT', '2026-07-11', null)]; // open-ended, entered Jul 11
    const status = calculateSchengenStatusExtended(visits, passports);

    // Days Used: Jul 11, 12, 13, 14 inclusive = 4 days (today counted per prior fix)
    expect(status.daysUsed).toBe(4);
    expect(status.daysRemaining).toBe(86); // naive: 90 - 4 = 86

    // Engine primitive: 87 (counts today because dayOffset 0 = today is inclusive)
    // The UI subtracts 1 (only when user is currently in Schengen) to yield 86.
    expect(status.maxStayFromToday).toBe(87);

    // "Until" date: today + (maxStayFromToday - 1) = Jul 14 + 86 = Oct 8
    const stayUntil = addDays(new Date(2026, 6, 14), status.maxStayFromToday - 1);
    expect(format(stayUntil, 'yyyy-MM-dd')).toBe('2026-10-08');
  });

  test('display layer contract: when currently in Schengen, "You Can Stay" = maxStayFromToday - 1', () => {
    // This test documents the DISPLAY contract enforced in
    //   /app/frontend/app/(tabs)/index.tsx
    //   /app/frontend/src/components/common/MiniMapCard.tsx
    // Engine returns 87, UI shows 86.
    const visits = [createVisit('PT', '2026-07-11', null)];
    const status = calculateSchengenStatusExtended(visits, passports);

    const rawMaxStay = status.maxStayFromToday;
    const isCurrentlyInSchengen = true; // user has an open Portugal visit today
    const displayedCanStay = isCurrentlyInSchengen ? Math.max(0, rawMaxStay - 1) : rawMaxStay;

    expect(displayedCanStay).toBe(86); // ← what the user sees on the dashboard
    expect(rawMaxStay).toBe(87);       // ← engine primitive unchanged
  });

  test('display layer contract: when NOT currently in Schengen, "You Can Stay" = maxStayFromToday raw', () => {
    // If the user has no active Schengen visit today (e.g., just returned from
    // Vietnam yesterday), today is a "fresh" day and should NOT be double-subtracted.
    const visits = [
      createVisit('VN', '2026-06-13', '2026-07-10', 'Custom'), // Vietnam, non-Schengen
    ];
    const status = calculateSchengenStatusExtended(visits, passports);

    expect(status.daysUsed).toBe(0); // no prior Schengen

    const rawMaxStay = status.maxStayFromToday;
    const isCurrentlyInSchengen = false; // user is NOT in Schengen today
    const displayedCanStay = isCurrentlyInSchengen ? Math.max(0, rawMaxStay - 1) : rawMaxStay;

    // A hypothetical fresh entry today gives the full raw window (no -1 subtraction)
    expect(displayedCanStay).toBe(rawMaxStay);
    expect(rawMaxStay).toBeGreaterThanOrEqual(90); // at least 90 days available fresh
  });
});
