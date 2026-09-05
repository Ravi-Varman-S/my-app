"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPatients(search?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("patients")
    .select("*, vitals_readings(id, status, recorded_at, heart_rate_bpm, blood_pressure, spo2_percent, temperature_c)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((patient) => {
    const readings = patient.vitals_readings ?? [];
    const latest = readings[0] ?? null;
    const pendingCount = readings.filter((r: any) => r.status === "pending").length;
    const criticalCount = readings.filter((r: any) => {
      const breaches: string[] = [];

      if (r.heart_rate_bpm != null) {
        if (r.heart_rate_bpm < 50 || r.heart_rate_bpm > 120) breaches.push("hr");
      }

      if (r.blood_pressure) {
        const parts = r.blood_pressure.split("/");
        if (parts.length === 2) {
          const sys = Number(parts[0]);
          const dia = Number(parts[1]);
          if (sys < 90 || sys > 180) breaches.push("sys");
          if (dia > 120) breaches.push("dia");
        }
      }

      if (r.spo2_percent != null && r.spo2_percent < 90) breaches.push("spo2");

      if (r.temperature_c != null) {
        if (r.temperature_c < 35 || r.temperature_c >= 39) breaches.push("temp");
      }

      return breaches.length > 0;
    }).length;

    return {
      ...patient,
      totalReadings: readings.length,
      pendingCount,
      criticalCount,
      latestReading: latest,
    };
  });
}

export async function getPatientWithReadings(id: string) {
  const supabase = await createClient();

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (patientError) throw patientError;

  const { data: readings, error: readingsError } = await supabase
    .from("vitals_readings")
    .select("*")
    .eq("patient_id", id)
    .order("recorded_at", { ascending: false });

  if (readingsError) throw readingsError;

  return { patient, readings: readings ?? [] };
}

export async function addPatient(formData: {
  full_name: string;
  date_of_birth: string;
}) {
  const supabase = await createClient();
  const name = formData.full_name.trim();

  const { data: existing } = await supabase
    .from("patients")
    .select("id")
    .ilike("full_name", name)
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: `A patient named "${name}" already exists.`, id: null };
  }

  const { data, error } = await supabase
    .from("patients")
    .insert({
      full_name: name,
      date_of_birth: formData.date_of_birth,
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath("/");
  return { error: null, id: data.id };
}

export async function deletePatient(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/");
}
