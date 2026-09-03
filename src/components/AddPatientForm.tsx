"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientFormInput } from "@/lib/validations";
import { addPatient } from "@/app/actions/patients";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AddPatientForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormInput>({
    resolver: zodResolver(patientSchema),
  });

  function onSubmit(data: PatientFormInput) {
    setError(null);
    startTransition(async () => {
      try {
        await addPatient(data);
        router.push("/");
      } catch (e: any) {
        setError(e.message ?? "Failed to add patient");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Patient Name</label>
        <input
          type="text"
          {...register("full_name")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g. Jane Smith"
        />
        {errors.full_name && (
          <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <input
          type="date"
          {...register("date_of_birth")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.date_of_birth && (
          <p className="mt-1 text-xs text-red-600">{errors.date_of_birth.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add Patient"}
      </button>
    </form>
  );
}
