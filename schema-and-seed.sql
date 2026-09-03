-- ============================================
-- PATIENT VITAL SIGNS DASHBOARD
-- Schema + Seed Data
-- ============================================

-- Drop tables if they exist (for re-runs)
DROP TABLE IF EXISTS vital_readings;
DROP TABLE IF EXISTS patients;

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vital_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  heart_rate INTEGER NOT NULL,
  blood_pressure_systolic INTEGER NOT NULL,
  blood_pressure_diastolic INTEGER NOT NULL,
  temperature NUMERIC(4,1) NOT NULL,
  respiratory_rate INTEGER NOT NULL,
  oxygen_saturation NUMERIC(4,1) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'normal',
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_vital_readings_patient_id ON vital_readings(patient_id);
CREATE INDEX idx_vital_readings_recorded_at ON vital_readings(recorded_at DESC);
CREATE INDEX idx_vital_readings_status ON vital_readings(status);

-- ============================================
-- SEED DATA: 12 PATIENTS
-- ============================================

INSERT INTO patients (id, name, date_of_birth) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Alice Johnson',    '1965-03-12'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Bob Martinez',      '1978-07-24'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Carol White',       '1952-11-08'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'David Lee',         '1990-01-15'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Emma Garcia',       '1983-06-30'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Frank Thompson',    '1947-09-19'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Grace Kim',         '1995-04-02'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Henry Wilson',      '1960-12-25'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'Irene Davis',       '1971-08-14'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'James Brown',       '1988-02-28'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Karen Nguyen',      '1959-05-17'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Liam O''Brien',     '1993-10-06');

-- ============================================
-- SEED DATA: 60 VITAL READINGS
-- Mix of NORMAL and BREACHED readings
-- ============================================

-- Patient 1: Alice Johnson (3 readings - 1 breach)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 72,  120, 80, 36.8, 16, 97.0, now() - interval '2 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 110, 145, 92, 38.5, 22, 93.0, now() - interval '1 hour',   'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 78,  118, 76, 36.9, 15, 98.0, now() - interval '30 minutes','normal',    false, NULL);

-- Patient 2: Bob Martinez (5 readings - 2 breaches)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 85,  130, 85, 37.0, 18, 96.0, now() - interval '5 hours',  'normal',    true,  now() - interval '4 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 55,  155, 98, 39.1, 26, 89.0, now() - interval '4 hours',  'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 88,  128, 82, 37.2, 17, 97.0, now() - interval '3 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 90,  132, 86, 37.1, 18, 96.5, now() - interval '2 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 105, 142, 90, 38.3, 24, 91.0, now() - interval '1 hour',   'breach',    false, NULL);

-- Patient 3: Carol White (5 readings - 3 breaches)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 95,  160, 100, 37.5, 20, 94.0, now() - interval '6 hours',  'breach',    true,  now() - interval '5 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 88,  148, 94, 37.2, 19, 95.0, now() - interval '5 hours',  'breach',    true,  now() - interval '4 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 80,  135, 88, 37.0, 18, 96.0, now() - interval '4 hours',  'normal',    true,  now() - interval '3 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 48,  170, 105, 38.8, 28, 88.0, now() - interval '2 hours',  'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 78,  125, 80, 36.7, 16, 98.0, now() - interval '1 hour',   'normal',    false, NULL);

-- Patient 4: David Lee (4 readings - 1 breach)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 70,  115, 75, 36.6, 14, 99.0, now() - interval '8 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 72,  118, 78, 36.7, 15, 98.5, now() - interval '6 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 68,  112, 72, 36.5, 14, 99.0, now() - interval '3 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 115, 138, 88, 39.2, 25, 90.0, now() - interval '1 hour',   'breach',    false, NULL);

-- Patient 5: Emma Garcia (5 readings - 2 breaches)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 82,  125, 82, 37.0, 17, 97.0, now() - interval '7 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 78,  122, 78, 36.9, 16, 97.5, now() - interval '5 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 120, 150, 95, 39.5, 28, 88.0, now() - interval '3 hours',  'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 85,  130, 84, 37.1, 18, 96.0, now() - interval '2 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 50,  148, 92, 38.4, 24, 90.0, now() - interval '30 minutes','breach',    false, NULL);

-- Patient 6: Frank Thompson (5 readings - 2 breaches)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 90,  155, 95, 37.3, 20, 93.0, now() - interval '10 hours', 'breach',    true,  now() - interval '9 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 85,  145, 90, 37.1, 19, 94.5, now() - interval '8 hours',  'breach',    true,  now() - interval '7 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 80,  138, 86, 37.0, 18, 95.0, now() - interval '5 hours',  'normal',    true,  now() - interval '4 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 75,  130, 82, 36.9, 17, 96.0, now() - interval '3 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 78,  132, 84, 36.8, 17, 96.5, now() - interval '1 hour',   'normal',    false, NULL);

-- Patient 7: Grace Kim (4 readings - 1 breach)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 68,  110, 70, 36.5, 14, 99.0, now() - interval '4 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 70,  112, 72, 36.6, 15, 98.5, now() - interval '3 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 108, 140, 90, 38.6, 24, 91.0, now() - interval '2 hours',  'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 72,  115, 74, 36.7, 15, 98.0, now() - interval '1 hour',   'normal',    false, NULL);

-- Patient 8: Henry Wilson (5 readings - 2 breaches)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 92,  142, 88, 37.2, 19, 94.0, now() - interval '9 hours',  'breach',    true,  now() - interval '8 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 85,  135, 84, 37.0, 18, 95.5, now() - interval '7 hours',  'normal',    true,  now() - interval '6 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 80,  130, 80, 36.9, 17, 96.0, now() - interval '4 hours',  'normal',    true,  now() - interval '3 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 45,  165, 102, 39.0, 30, 87.0, now() - interval '2 hours',  'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 78,  128, 82, 36.8, 16, 97.0, now() - interval '1 hour',   'normal',    false, NULL);

-- Patient 9: Irene Davis (5 readings - 2 breaches)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 76,  122, 78, 36.8, 16, 97.5, now() - interval '6 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 112, 148, 94, 38.7, 26, 90.0, now() - interval '4 hours',  'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 82,  128, 80, 37.0, 17, 96.5, now() - interval '3 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 58,  152, 96, 38.2, 23, 91.5, now() - interval '2 hours',  'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 74,  120, 76, 36.7, 15, 98.0, now() - interval '30 minutes','normal',    false, NULL);

-- Patient 10: James Brown (5 readings - 1 breach)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 75,  120, 78, 36.7, 15, 98.0, now() - interval '7 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 78,  122, 80, 36.8, 16, 97.5, now() - interval '5 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 80,  125, 82, 36.9, 16, 97.0, now() - interval '3 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 125, 155, 98, 39.8, 30, 86.0, now() - interval '1 hour',   'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 82,  128, 84, 37.0, 17, 96.5, now() - interval '15 minutes','normal',    false, NULL);

-- Patient 11: Karen Nguyen (5 readings - 3 breaches)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 100, 158, 98, 37.8, 22, 92.0, now() - interval '8 hours',  'breach',    true,  now() - interval '7 hours'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 52,  168, 104, 39.4, 28, 87.0, now() - interval '6 hours',  'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 88,  140, 88, 37.1, 19, 95.0, now() - interval '4 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 42,  172, 108, 39.8, 32, 84.0, now() - interval '2 hours',  'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 78,  125, 80, 36.9, 16, 97.0, now() - interval '1 hour',   'normal',    false, NULL);

-- Patient 12: Liam O'Brien (5 readings - 1 breach)
INSERT INTO vital_readings (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, respiratory_rate, oxygen_saturation, recorded_at, status, acknowledged, acknowledged_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 74,  118, 76, 36.7, 15, 98.0, now() - interval '5 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 76,  120, 78, 36.8, 16, 97.5, now() - interval '4 hours',  'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 108, 142, 92, 38.4, 24, 90.0, now() - interval '2 hours',  'breach',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 80,  125, 80, 37.0, 17, 96.5, now() - interval '1 hour',   'normal',    false, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 82,  128, 82, 37.1, 17, 97.0, now() - interval '10 minutes','normal',    false, NULL);
