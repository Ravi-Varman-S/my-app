-- Row Level Security policies for vitals review queue
-- All visitors are treated as authorized users (no login required)

-- Patients: read and insert only (no delete)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_select"
  ON patients FOR SELECT
  USING (true);

CREATE POLICY "patients_insert"
  ON patients FOR INSERT
  WITH CHECK (true);

-- Vitals readings: read, insert, and update (for acknowledge) — no delete
ALTER TABLE vitals_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vitals_readings_select"
  ON vitals_readings FOR SELECT
  USING (true);

CREATE POLICY "vitals_readings_insert"
  ON vitals_readings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "vitals_readings_update"
  ON vitals_readings FOR UPDATE
  USING (true)
  WITH CHECK (true);
