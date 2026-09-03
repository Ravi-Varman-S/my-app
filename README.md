# Vital Signs Review Queue

A single-page dashboard for reviewing and acknowledging patient vital sign readings. Built with Next.js, Supabase, and Tailwind CSS.

## Running locally

```bash
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm install
npm run dev
```

## What's finished

- **60 seeded readings** across 12 patients with realistic clinical scenarios
- **Threshold-based breach detection** at runtime: HR <50/>120, Systolic <90/>180, Diastolic >120, SpO2 <90%, Temp <35/>=39
- **Table layout** with columns: Patient, Age (derived from DOB), Recorded At, HR, BP, SpO2, Temp, Status, Notes
- **Critical rows** marked with red background, warning icon, and text labels (not color alone)
- **Search** with 300ms debounce filtering by patient name
- **Status filter** with All / Pending / Acknowledged options
- **Acknowledge button** updates status to "acknowledged" in Supabase; shows "Acknowledged" text for already-acknowledged rows
- **Add Patient form**: Zod validated, name min 2 chars, DOB cannot be future
- **Add Reading form**: HR and BP required, systolic > diastolic validation, SpO2/temp optional
- **Error handling**: Shows retry button on fetch failure
- **Null handling**: Missing values show as "—"
- **UTC to local time** conversion for recorded_at

## What's not finished

- **Optimistic UI for Acknowledge**: Currently does a server action and reloads. I didn't get to the optimistic update with rollback on failure pattern.
- **Double-click guard**: The acknowledge button disables while saving but doesn't prevent rapid double-clicks creating duplicate requests.
- **Loading skeleton / stable layout**: There's no skeleton loading state during initial page load — the page just renders when data arrives. A skeleton would prevent layout shift.
- **Middleware migration**: Still using the deprecated `middleware.ts` instead of Next.js 16's `proxy.ts`.

## If I had two more days

I'd add optimistic UI for the Acknowledge button — immediately flip the row to "Acknowledged" state, then roll back if the server action fails. Right now the page reloads after every acknowledge, which feels sluggish. A skeleton loader during initial load would also be the first thing I'd add.

## Assumptions

- **Status is runtime-only**: The spec was silent on whether "critical" should be stored. I treat it as computed from thresholds — the DB only stores `pending` or `acknowledged`. This means breach status can change if thresholds are updated.
- **Blood pressure as text**: Stored as "120/80" string rather than separate systolic/diastolic columns. Parsed on the client for threshold checks.
- **No authentication**: Supabase RLS policies allow all operations from the anon key. The spec didn't mention auth.
- **Spo2 and temperature are nullable**: Some readings intentionally have missing values to test the "—" display.
