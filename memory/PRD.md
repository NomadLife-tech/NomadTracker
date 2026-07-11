# Nomad Time Tracker — PRD / Progress Memory

## Product
Production React Native Expo app (TestFlight) for tracking travel visits, visa compliance and the Schengen 90/180 rule. FastAPI + MongoDB backend for optional cloud sync. Local-first (AsyncStorage). 10 languages (en, es, fr, de, pt, zh, ja, ko, it, ru).

## Core mandates from user
- ZERO-RISK CHANGES ONLY. Analyze first, get approval before modifying files.
- User is highly deployment-anxious (C-PTSD) — be empathetic, reassuring, never push breaking changes.
- Build workflow: Agent saves on Emergent → user clicks 'Save' → on Mac: `git checkout -- app.json eas.json` → `git pull` → `eas build --platform ios --profile production`.
- Current iOS buildNumber in app.json: **48**.

## Schengen engine (verified correct — do not modify)
- `/app/frontend/src/utils/schengenEngine.ts` — EU-compliant date-array + rolling-sum engine.
- `daysUsed` = days in trailing 180-day window. `maxStayFromToday` = forward simulation (roll-off aware). `legalFullReEntryDate` = earliest full-90 entry.
- 48 jest tests pass (`cd /app/frontend && npx jest`), incl. `userScenario_exactData.test.ts` documenting the July 11 user report.

## This session (June/July 2026)
- USER BUG REPORT resolved: user (2 closed PT visits Jan 17–Mar 9 + Mar 14–Apr 11, landing Jul 11) saw "82 used / 8 remaining" and expected fresh 90. Investigation proved engine correct: maxStayFromToday = 90 (old days roll off during stay), legalFullReEntryDate = Jul 11. The naive "Days Remaining = 90 − used" display was the problem.
- FIX (display-layer only, user approved "both fixes"):
  - Dashboard Schengen card (`app/(tabs)/index.tsx`): replaced "Days Remaining"/"Max Stay" boxes with "You Can Stay" (= maxStayFromToday) + "Until" (= today + canStay − 1). Roll-off explainer note shown when canStay > 90 − daysUsed. Progress bar = (90 − canStay)/90. Window period text moved under Days Used. Fresh-90 widget subtext shows "Available now" when reEntryDate ≤ today.
  - MiniMapCard: Schengen visits show "You Can Stay" + "Until <date>"; minimized pill uses t('daysLeft').
  - 4 new i18n keys in all 10 languages: youCanStay, stayUntil, rollOffNote, daysLeft.
  - Fixed pre-existing test rot in schengenEngine.test.ts (hardcoded 2025 dates now use jest fake timers).
- Testing agent verified all 7 frontend scenarios PASS (report: /app/test_reports/iteration_1.json).
- Stay countdown row added (user-approved enhancement): dashboard Schengen card shows "{n} days left of this stay" when currently inside Schengen on a counting visit AND canStayDays ≤ 30. Amber (time icon) >7 days, red (alert icon) ≤7, "Last day of this stay" at 1. i18n keys daysLeftOfStay/lastDayOfStay in all 10 languages. Verified via seeded screenshot (77 used / 14 can stay / Until Jul 24 / countdown visible). Build number bumped to 48.

## Known optional follow-ups (user approval required — zero-risk mandate)
- `(profile.insurances || []).map` defensive fallback in profile.tsx:900 (only crashes with malformed seed data, real users unaffected).
- Locale-aware date month abbreviations (`format(date,'MMM d')` stays English in non-EN locales) — pre-existing.
- MiniMap shows capital cities instead of GPS position — user agreed to leave as-is pre-launch.

## Upcoming tasks
- RevenueCat integration ($2.95/mo, $22.95/yr, $39.95 lifetime) — user planned for the weekend.
- Tax data export (CSV/PDF) (P3).

## Key endpoints / storage
- POST /api/sync, GET /api/sync/:id. AsyncStorage keys: @nomad_visits, @nomad_profile; zustand store 'nomad-visits-storage'.
