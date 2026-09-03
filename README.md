# Vital Signs Dashboard

A single-page web application for clinicians to view, acknowledge, and add patient vital signs readings. Built with Next.js 16, Supabase, and deployed on Vercel.

## Live URL

**https://my-app-chi-silk-39.vercel.app**

## GitHub Repository

**https://github.com/Ravi-Varman-S/my-app**

## How to Run Locally

### Prerequisites

- Node.js 18+ installed
- A Supabase project (free tier works)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Ravi-Varman-S/my-app.git
   cd my-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root with these values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   See `.env.example` for the required key names.

4. Set up the database — run the SQL in `schema-and-seed-v2.sql` in your Supabase SQL Editor. This creates two tables and seeds 60 readings across 12 patients.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## What's Finished

All core features are implemented and working:

- **View all vital readings** — displayed in a responsive table, newest first
- **Critical threshold detection** — breaches flagged with red rows, color-coded badges, and warning icons (accessible for colorblind users)
- **Search by patient name** — debounced input (300ms) for real-time filtering
- **Status filter** — toggle between All / Pending / Acknowledged readings
- **Acknowledge readings** — click to mark as acknowledged (updates status in Supabase)
- **Add new patient** — form with validation (name min 2 chars, DOB not in the future)
- **Add new vital reading** — form with validation (HR and BP required, systolic > diastolic enforced)
- **Responsive layout** — works on mobile, tablet, and desktop
- **Age calculated from DOB** — not stored, computed at render time
- **RLS security** — Row Level Security enabled with public read/write policies
- **Clinical thresholds** — HR <50/>120, Systolic <90/>180, Diastolic >120, SpO2 <90%, Temp <35/≥39

## What's Not Finished

- **No unit or integration tests** — threshold detection and form validation are untested
- **No loading skeletons** — loading state shows a spinner instead of skeleton UI
- **No pagination** — all readings load at once (works for 60 rows, but would need pagination for larger datasets)
- **No authentication** — the app is publicly accessible; RLS policies allow anonymous read/write
- **Deprecated middleware** — uses `middleware.ts` instead of the recommended `proxy.ts` (Next.js 16)

## Two-Day Improvements

If I had two more days, I would:

1. **Add unit tests** — test `detectBreaches()`, `parseBloodPressure()`, `calculateAge()`, and form validation schemas using Vitest
2. **Add loading skeletons** — improve perceived performance with skeleton UI components
3. **Implement pagination** — add server-side pagination for the readings table
4. **Replace middleware with proxy.ts** — follow Next.js 16 best practices
5. **Add proper authentication** — integrate Supabase Auth with role-based access (clinician vs admin)

## Assumptions Made

- **Blood pressure stored as text** — the spec required `"138/88"` format; parsed at runtime into systolic/diastolic for threshold checks
- **Missing vitals are not breaches** — if SpO2 or temperature is null, it is not treated as a critical reading; only values that exist AND violate thresholds are flagged
- **No delete functionality** — the spec does not mention deleting readings; RLS policies block DELETE operations
- **Status is per-reading, not per-patient** — each vital reading has its own pending/acknowledged status
- **UTC timestamps** — all `recorded_at` values are stored in UTC and displayed in the user's local timezone

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.3.4, React 19, TypeScript, Tailwind CSS 4 |
| Forms | react-hook-form 7.87, Zod 4.5.4 |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |
| State | Server Components + Client Components (useTransition for optimistic UI) |

## Database Schema

```sql
patients
├── id (UUID, primary key)
├── full_name (TEXT)
└── date_of_birth (DATE)

vitals_readings
├── id (UUID, primary key)
├── patient_id (UUID, foreign key → patients)
├── recorded_at (TIMESTAMPTZ)
├── heart_rate_bpm (NUMERIC)
├── blood_pressure (TEXT, e.g. "138/88")
├── spo2_percent (NUMERIC, nullable)
├── temperature_c (NUMERIC, nullable)
├── status (TEXT: 'pending' or 'acknowledged')
└── notes (TEXT)
```

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server actions (CRUD operations)
│   │   ├── patients.ts
│   │   └── readings.ts
│   ├── patients/new/     # Add patient form page
│   ├── readings/new/     # Add reading form page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard
├── components/           # Reusable UI components
│   ├── AcknowledgeButton.tsx
│   ├── AddPatientForm.tsx
│   ├── AddReadingForm.tsx
│   ├── ReadingsList.tsx
│   ├── SearchBar.tsx
│   ├── StatusFilter.tsx
│   └── VitalBadge.tsx
├── lib/
│   ├── supabase/         # Supabase client setup
│   │   ├── client.ts
│   │   └── server.ts
│   ├── thresholds.ts     # Clinical threshold logic
│   └── validations.ts    # Zod validation schemas
└── middleware.ts          # Supabase session refresh
```
