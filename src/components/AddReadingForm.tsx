"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { readingSchema } from "@/lib/validations";
import { addReading } from "@/app/actions/readings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Patient } from "@/lib/thresholds";

export function AddReadingForm({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(readingSchema),
  });

  function onSubmit(data: any) {
    setError(null);
    startTransition(async () => {
      try {
        await addReading({
          patient_id: data.patient_id,
          heart_rate_bpm: data.heart_rate_bpm ? Number(data.heart_rate_bpm) : null,
          blood_pressure: data.blood_pressure || null,
          spo2_percent: data.spo2_percent ? Number(data.spo2_percent) : null,
          temperature_c: data.temperature_c ? Number(data.temperature_c) : null,
          notes: data.notes || null,
        });
        router.push("/");
      } catch (e: any) {
        setError(e.message ?? "Failed to add reading");
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
        <label className="block text-sm font-medium text-gray-700">Patient</label>
        <select
          {...register("patient_id")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select patient...</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>
        {errors.patient_id && (
          <p className="mt-1 text-xs text-red-600">{errors.patient_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm) *</label>
          <input
            type="number"
            step="0.1"
            {...register("heart_rate_bpm")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. 72"
          />
          {errors.heart_rate_bpm && (
            <p className="mt-1 text-xs text-red-600">{errors.heart_rate_bpm.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Blood Pressure *</label>
          <input
            type="text"
            {...register("blood_pressure")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="120/80"
          />
          {errors.blood_pressure && (
            <p className="mt-1 text-xs text-red-600">{errors.blood_pressure.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SpO2 (%)</label>
          <input
            type="number"
            step="0.1"
            {...register("spo2_percent")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
          <input
            type="number"
            step="0.1"
            {...register("temperature_c")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          {...register("notes")}
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Optional"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add Reading"}
      </button>
    </form>
  );
}
