"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPatients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("full_name");

  if (error) throw error;
  return data;
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
    throw new Error(`A patient named "${name}" already exists.`);
  }

  const { error } = await supabase.from("patients").insert({
    full_name: name,
    date_of_birth: formData.date_of_birth,
  });

  if (error) throw error;
  revalidatePath("/");
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
