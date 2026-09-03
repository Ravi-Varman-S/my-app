-- Drop old tables
DROP TABLE IF EXISTS vitals_readings CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL
);

-- Vitals readings table
CREATE TABLE vitals_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  heart_rate_bpm NUMERIC,
  blood_pressure TEXT,
  spo2_percent NUMERIC,
  temperature_c NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT
);

-- Indexes
CREATE INDEX idx_vr_patient_id ON vitals_readings(patient_id);
CREATE INDEX idx_vr_recorded_at ON vitals_readings(recorded_at DESC);
CREATE INDEX idx_vr_status ON vitals_readings(status);

-- RLS policies (see supabase/policies.sql for readable version)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patients_select" ON patients FOR SELECT USING (true);
CREATE POLICY "patients_insert" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "vitals_readings_select" ON vitals_readings FOR SELECT USING (true);
CREATE POLICY "vitals_readings_insert" ON vitals_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "vitals_readings_update" ON vitals_readings FOR UPDATE USING (true) WITH CHECK (true);

-- Seed 12 patients
INSERT INTO patients (id, full_name, date_of_birth) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Alice Johnson', '1965-03-12'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Bob Martinez', '1978-07-24'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Carol White', '1952-11-30'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'David Lee', '1988-01-15'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Emma Garcia', '1973-06-08'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Frank Thompson', '1960-09-22'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Grace Kim', '1995-04-17'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Henry Wilson', '1948-12-03'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'Irene Davis', '1982-08-19'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'James Brown', '1970-02-28'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Karen Nguyen', '1958-10-05'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Liam O''Brien', '1991-07-14');

-- Seed 60 vitals readings
-- Status: 'pending' = not yet reviewed, 'acknowledged' = reviewed
-- Clinical breach detection happens at runtime via thresholds, NOT via status column
INSERT INTO vitals_readings (patient_id, recorded_at, heart_rate_bpm, blood_pressure, spo2_percent, temperature_c, status, notes) VALUES

-- Alice Johnson (5 readings) — all normal vitals
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', '2026-09-02T10:00:00Z', 72, '120/80', 97, 36.8, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', '2026-09-02T14:00:00Z', 75, '122/82', 96.5, 36.9, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', '2026-09-02T18:00:00Z', 78, '125/80', NULL, 37.0, 'pending', 'SpO2 not measured'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', '2026-09-02T22:00:00Z', 70, '118/76', 98, 36.7, 'acknowledged', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', '2026-09-03T02:00:00Z', 74, '121/79', 97.5, 36.8, 'pending', NULL),

-- Bob Martinez (5 readings) — critical HR and temp
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', '2026-09-02T10:00:00Z', 105, '142/90', 91, 38.3, 'pending', 'Elevated heart rate and temp'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', '2026-09-02T14:00:00Z', 130, '155/95', 88, 39.2, 'pending', 'CRITICAL: tachycardia + hypertensive + fever'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', '2026-09-02T18:00:00Z', 88, '130/85', 96, 37.2, 'pending', 'Improved'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', '2026-09-02T22:00:00Z', 78, '125/82', 97, 36.9, 'acknowledged', 'Stabilized'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', '2026-09-03T02:00:00Z', 82, '128/84', 96.5, 37.0, 'pending', NULL),

-- Carol White (5 readings) — critical bradycardia + hypertensive
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', '2026-09-02T09:00:00Z', 48, '170/105', 88, 38.8, 'pending', 'CRITICAL: bradycardia + hypertensive crisis + fever'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', '2026-09-02T13:00:00Z', 52, '165/100', 89, 38.6, 'pending', 'Slight improvement'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', '2026-09-02T17:00:00Z', 88, '148/94', 95, 37.2, 'acknowledged', 'Stabilized'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', '2026-09-02T21:00:00Z', 65, '135/88', 97, 37.0, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', '2026-09-03T01:00:00Z', 70, '128/82', 97.5, 36.9, 'pending', NULL),

-- David Lee (5 readings) — all normal
('a1b2c3d4-e5f6-7890-abcd-ef1234567804', '2026-09-02T10:00:00Z', 68, '112/72', 99, 36.5, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567804', '2026-09-02T14:00:00Z', 82, '126/80', 97, 37.0, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567804', '2026-09-02T18:00:00Z', 70, '115/75', 99, 36.6, 'acknowledged', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567804', '2026-09-02T22:00:00Z', 75, '120/78', 98, 36.7, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567804', '2026-09-03T02:00:00Z', 72, '118/76', 98.5, 36.6, 'pending', NULL),

-- Emma Garcia (5 readings) — critical HR low + SpO2 + temp
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', '2026-09-02T10:00:00Z', 45, '148/92', 88, 38.4, 'pending', 'CRITICAL: bradycardia + hypoxia + fever'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', '2026-09-02T14:00:00Z', 85, '130/84', 96, 37.1, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', '2026-09-02T18:00:00Z', 125, '150/95', 85, 39.5, 'pending', 'CRITICAL: tachycardia + fever + hypoxia'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', '2026-09-02T22:00:00Z', 90, '135/88', 94, 38.0, 'acknowledged', 'Improving'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', '2026-09-03T02:00:00Z', 82, '125/82', 96.5, 37.2, 'pending', NULL),

-- Frank Thompson (5 readings) — mild breaches
('a1b2c3d4-e5f6-7890-abcd-ef1234567806', '2026-09-02T09:00:00Z', 85, '145/90', 94.5, 37.1, 'pending', 'BP elevated, SpO2 borderline'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567806', '2026-09-02T13:00:00Z', 78, '138/86', 95, 37.0, 'acknowledged', 'Borderline'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567806', '2026-09-02T17:00:00Z', 80, '132/84', 96.5, 36.8, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567806', '2026-09-02T21:00:00Z', 76, '128/82', 97, 36.9, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567806', '2026-09-03T01:00:00Z', 74, '125/80', 97.5, 36.8, 'pending', NULL),

-- Grace Kim (5 readings) — severe then recovery
('a1b2c3d4-e5f6-7890-abcd-ef1234567807', '2026-09-02T10:00:00Z', 135, '140/90', 86, 39.1, 'pending', 'CRITICAL: severe tachycardia + fever + hypoxia'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567807', '2026-09-02T14:00:00Z', 72, '115/74', 98, 36.7, 'pending', 'Full recovery'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567807', '2026-09-02T18:00:00Z', 70, '112/72', 98.5, 36.5, 'acknowledged', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567807', '2026-09-02T22:00:00Z', 68, '110/70', 99, 36.4, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567807', '2026-09-03T02:00:00Z', 72, '118/76', 98, 36.7, 'pending', NULL),

-- Henry Wilson (5 readings) — critical multi-system
('a1b2c3d4-e5f6-7890-abcd-ef1234567808', '2026-09-02T09:00:00Z', 42, '165/102', 85, 39.5, 'pending', 'EMERGENCY: severe bradycardia + hypertensive + fever + hypoxia'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567808', '2026-09-02T13:00:00Z', 80, '135/84', 95.5, 37.0, 'acknowledged', 'Significant improvement'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567808', '2026-09-02T17:00:00Z', 85, '130/80', 96, 36.9, 'pending', 'Stable'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567808', '2026-09-02T21:00:00Z', 78, '125/78', 97, 36.8, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567808', '2026-09-03T01:00:00Z', 75, '122/76', 97.5, 36.7, 'pending', NULL),

-- Irene Davis (5 readings) — fluctuating
('a1b2c3d4-e5f6-7890-abcd-ef1234567809', '2026-09-02T10:00:00Z', 82, '128/80', 96.5, 37.0, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567809', '2026-09-02T14:00:00Z', 125, '148/94', 88, 39.2, 'pending', 'CRITICAL: tachycardia + fever + hypoxia'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567809', '2026-09-02T18:00:00Z', 76, '122/78', 97.5, 36.8, 'acknowledged', 'Resolved'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567809', '2026-09-02T22:00:00Z', 78, '125/80', 97, 36.9, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567809', '2026-09-03T02:00:00Z', 80, '126/82', 96.5, 37.0, 'pending', NULL),

-- James Brown (5 readings) — consistent normal
('a1b2c3d4-e5f6-7890-abcd-ef1234567810', '2026-09-02T10:00:00Z', 80, '125/82', 97, 36.9, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567810', '2026-09-02T14:00:00Z', 76, '122/78', 97.5, 36.8, 'acknowledged', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567810', '2026-09-02T18:00:00Z', 78, '122/80', 97.5, 36.8, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567810', '2026-09-02T22:00:00Z', 82, '128/84', 96.5, 37.0, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567810', '2026-09-03T02:00:00Z', 78, '124/80', 97, 36.9, 'pending', NULL),

-- Karen Nguyen (5 readings) — severe multi-system
('a1b2c3d4-e5f6-7890-abcd-ef1234567811', '2026-09-02T10:00:00Z', 38, '172/108', 82, 39.8, 'pending', 'EMERGENCY: severe bradycardia + hypertensive crisis + fever + hypoxia'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567811', '2026-09-02T14:00:00Z', 52, '168/104', 87, 39.4, 'pending', 'Still critical'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567811', '2026-09-02T18:00:00Z', 88, '140/88', 95, 37.1, 'acknowledged', 'Responding to treatment'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567811', '2026-09-02T22:00:00Z', 75, '125/80', 97, 36.9, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567811', '2026-09-03T02:00:00Z', 78, '128/82', 96.5, 37.0, 'pending', NULL),

-- Liam O'Brien (5 readings) — missing data scenarios
('a1b2c3d4-e5f6-7890-abcd-ef1234567812', '2026-09-02T10:00:00Z', 82, '128/82', 97, 37.1, 'pending', NULL),
('a1b2c3d4-e5f6-7890-abcd-ef1234567812', '2026-09-02T14:00:00Z', 80, '125/80', NULL, 37.0, 'pending', 'SpO2 probe malfunction'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567812', '2026-09-02T18:00:00Z', 125, '142/92', 88, 38.4, 'pending', 'CRITICAL: tachycardia + fever + hypoxia'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567812', '2026-09-02T22:00:00Z', 78, '122/78', 97, 36.8, 'acknowledged', 'Improved'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567812', '2026-09-03T02:00:00Z', 80, '125/80', 97.5, 36.9, 'pending', NULL);
