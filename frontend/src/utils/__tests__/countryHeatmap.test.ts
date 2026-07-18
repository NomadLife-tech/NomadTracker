/**
 * Regression tests for the year-filterable Country Heatmap.
 * Verifies the heatmap uses the SAME local-midnight day counting as the
 * Days per Country chart (calculateTaxDays), so both cards always align.
 */
import { calculateCountryHeatmap } from '../statisticsUtils';
import { calculateTaxDays, getToday } from '../dateUtils';
import { Visit } from '../../types';

const currentYear = getToday().getFullYear();

function makeVisit(overrides: Partial<Visit>): Visit {
  return {
    id: Math.random().toString(36).slice(2),
    countryCode: 'PT',
    countryName: 'Portugal',
    entryDate: `${currentYear}-01-01`,
    exitDate: `${currentYear}-01-10`,
    visaType: 'Schengen C (Short Stay)',
    ...overrides,
  } as Visit;
}

describe('calculateCountryHeatmap (year-filtered)', () => {
  it('counts days inclusively within the selected year', () => {
    const visits = [makeVisit({ entryDate: `${currentYear}-02-01`, exitDate: `${currentYear}-02-10` })];
    const result = calculateCountryHeatmap(visits, currentYear);
    expect(result).toHaveLength(1);
    expect(result[0].countryCode).toBe('PT');
    expect(result[0].totalDays).toBe(10); // Feb 1–10 inclusive
  });

  it('clamps visits spanning a year boundary to the selected year only', () => {
    const prevYear = currentYear - 1;
    const visits = [
      makeVisit({ entryDate: `${prevYear}-12-28`, exitDate: `${currentYear}-01-05` }),
    ];
    const thisYear = calculateCountryHeatmap(visits, currentYear);
    expect(thisYear[0].totalDays).toBe(5); // Jan 1–5

    const lastYear = calculateCountryHeatmap(visits, prevYear);
    expect(lastYear[0].totalDays).toBe(4); // Dec 28–31
  });

  it('excludes visits entirely outside the selected year', () => {
    const visits = [
      makeVisit({ entryDate: `${currentYear - 1}-03-01`, exitDate: `${currentYear - 1}-03-10` }),
    ];
    expect(calculateCountryHeatmap(visits, currentYear)).toHaveLength(0);
  });

  it('counts an ongoing visit (no exit date) up to today inclusive', () => {
    const visits = [makeVisit({ entryDate: `${currentYear}-01-01`, exitDate: undefined })];
    const heatmap = calculateCountryHeatmap(visits, currentYear);
    const tax = calculateTaxDays(visits, currentYear);
    // Must match the Days per Country chart exactly — no Math.ceil drift
    expect(heatmap[0].totalDays).toBe(tax[0].days);
  });

  it('always produces identical per-country totals to the Days per Country chart', () => {
    const visits = [
      makeVisit({ countryCode: 'PT', countryName: 'Portugal', entryDate: `${currentYear}-01-01`, exitDate: `${currentYear}-03-30` }),
      makeVisit({ countryCode: 'MT', countryName: 'Malta', entryDate: `${currentYear}-03-30`, exitDate: `${currentYear}-04-15` }),
      makeVisit({ countryCode: 'GB', countryName: 'United Kingdom', entryDate: `${currentYear - 1}-12-20`, exitDate: `${currentYear}-01-08` }),
    ];
    const heatmap = calculateCountryHeatmap(visits, currentYear);
    const tax = calculateTaxDays(visits, currentYear);

    tax.forEach((taxItem) => {
      const heatItem = heatmap.find((h) => h.countryCode === taxItem.countryCode);
      expect(heatItem).toBeDefined();
      expect(heatItem!.totalDays).toBe(taxItem.days);
    });
  });
});
