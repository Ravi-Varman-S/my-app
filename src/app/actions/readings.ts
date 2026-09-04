"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getReadings(search?: string, status?: string) {
  const supabase = await createClient();

  let matchingPatientIds: string[] | null = null;

  if (search) {
    const { data: matchedPatients, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .ilike("full_name", `%${search}%`);

    if (patientError) throw patientError;
    matchingPatientIds = matchedPatients?.map((p) => p.id) ?? [];

    if (matchingPatientIds.length === 0) return [];
  }

  let query = supabase
    .from("vitals_readings")
    .select("*, patients(*)")
    .order("recorded_at", { ascending: false });

  if (matchingPatientIds) {
    query = query.in("patient_id", matchingPatientIds);
  }

  if (status === "pending") {
    query = query.eq("status", "pending");
  } else if (status === "acknowledged") {
    query = query.eq("status", "acknowledged");
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function acknowledgeReading(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vitals_readings")
    .update({ status: "acknowledged" })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/");
}

export async function deleteReading(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vitals_readings")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/");
}

export async function addReading(formData: {
  patient_id: string;
  heart_rate_bpm: number | null;
  blood_pressure: string | null;
  spo2_percent: number | null;
  temperature_c: number | null;
  notes: string | null;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("vitals_readings").insert({
    patient_id: formData.patient_id,
    heart_rate_bpm: formData.heart_rate_bpm,
    blood_pressure: formData.blood_pressure || null,
    spo2_percent: formData.spo2_percent,
    temperature_c: formData.temperature_c,
    notes: formData.notes || null,
    status: "pending",
  });

  if (error) throw error;
  revalidatePath("/");
}
