export interface Patient {
  id: string;
  full_name: string;
  date_of_birth: string;
}

export interface VitalReading {
  id: string;
  patient_id: string;
  recorded_at: string;
  heart_rate_bpm: number | null;
  blood_pressure: string | null;
  spo2_percent: number | null;
  temperature_c: number | null;
  status: string;
  notes: string | null;
  patients?: Patient;
}

const THRESHOLDS = {
  heart_rate_bpm: { min: 50, max: 120 },
  spo2_percent: { min: 90, max: 100 },
  temperature_c: { min: 35.0, max: 39.0 },
} as const;

const BP_SYSTOLIC = { min: 90, max: 180 };
const BP_DIASTOLIC = { max: 120 };

export interface Breach {
  field: string;
  label: string;
  value: string;
  threshold?: string;
}

export function parseBloodPressure(bp: string | null): { systolic: number; diastolic: number } | null {
  if (!bp) return null;
  const parts = bp.split("/");
  if (parts.length !== 2) return null;
  const systolic = Number(parts[0]);
  const diastolic = Number(parts[1]);
  if (isNaN(systolic) || isNaN(diastolic)) return null;
  return { systolic, diastolic };
}

export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function checkBreaches(reading: VitalReading): Breach[] {
  const breaches: Breach[] = [];

  if (reading.heart_rate_bpm != null) {
    const v = reading.heart_rate_bpm;
    if (v < THRESHOLDS.heart_rate_bpm.min || v > THRESHOLDS.heart_rate_bpm.max) {
      breaches.push({
        field: "heart_rate_bpm",
        label: "Heart Rate",
        value: `${v} bpm`,
        threshold: `<50 or >120`,
      });
    }
  }

  const bp = parseBloodPressure(reading.blood_pressure);
  if (bp) {
    if (bp.systolic < BP_SYSTOLIC.min || bp.systolic > BP_SYSTOLIC.max) {
      breaches.push({
        field: "bp_systolic",
        label: "BP Systolic",
        value: `${bp.systolic}`,
        threshold: `<90 or >180`,
      });
    }
    if (bp.diastolic > BP_DIASTOLIC.max) {
      breaches.push({
        field: "bp_diastolic",
        label: "BP Diastolic",
        value: `${bp.diastolic}`,
        threshold: `>120`,
      });
    }
  }

  if (reading.spo2_percent != null) {
    const v = reading.spo2_percent;
    if (v < THRESHOLDS.spo2_percent.min) {
      breaches.push({
        field: "spo2_percent",
        label: "SpO2",
        value: `${v}%`,
        threshold: `<90`,
      });
    }
  }

  if (reading.temperature_c != null) {
    const v = reading.temperature_c;
    if (v < THRESHOLDS.temperature_c.min || v >= THRESHOLDS.temperature_c.max) {
      breaches.push({
        field: "temperature_c",
        label: "Temp",
        value: `${v}°C`,
        threshold: `<35 or ≥39`,
      });
    }
  }

  return breaches;
}

export function hasBreaches(reading: VitalReading): boolean {
  return checkBreaches(reading).length > 0;
}
