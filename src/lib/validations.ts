import { z } from "zod";

export const readingSchema = z.object({
  patient_id: z.string().uuid("Select a valid patient"),
  heart_rate_bpm: z.string().min(1, "Heart rate is required").regex(/^\d+(\.\d+)?$/, "Must be a number"),
  blood_pressure: z.string().min(1, "Blood pressure is required").regex(/^\d{2,3}\/\d{2,3}$/, "Format: 120/80").refine(
    (val) => {
      const parts = val.split("/");
      return Number(parts[0]) > Number(parts[1]);
    },
    { message: "Systolic must be greater than diastolic" }
  ),
  spo2_percent: z.string().optional().nullable(),
  temperature_c: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const patientSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(200),
  date_of_birth: z.string().min(1, "Date of birth is required").refine(
    (val) => {
      const dob = new Date(val);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return dob <= today;
    },
    { message: "Date of birth cannot be in the future" }
  ),
});

export type ReadingFormInput = {
  patient_id: string;
  heart_rate_bpm: string;
  blood_pressure: string;
  spo2_percent: string;
  temperature_c: string;
  notes: string;
};

export type PatientFormInput = {
  full_name: string;
  date_of_birth: string;
};
