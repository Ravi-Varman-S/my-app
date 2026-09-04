"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { readingSchema } from "@/lib/validations";
import { addReading } from "@/app/actions/readings";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { Patient } from "@/lib/thresholds";

export function AddReadingForm({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(readingSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const selectedPatient = watch("patient_id");
  const selectedName = patients.find((p) => p.id === selectedPatient)?.full_name ?? "";

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectPatient(id: string) {
    setValue("patient_id", id, { shouldValidate: true });
    setOpen(false);
    setSearch("");
  }

  function clearPatient() {
    setValue("patient_id", "", { shouldValidate: true });
    setSearch("");
  }

  async function onSubmit(data: any) {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
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
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setOpen(!open)}
            className="mt-1 flex cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <span className={selectedName ? "" : "text-gray-400"}>
              {selectedName || "Select patient..."}
            </span>
            <div className="flex items-center gap-1">
              {selectedPatient && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearPatient(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {open && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 p-2">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <ul className="max-h-48 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-gray-500">No patients found</li>
                ) : (
                  filtered.map((p) => (
                    <li
                      key={p.id}
                      onClick={() => selectPatient(p.id)}
                      className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 ${
                        p.id === selectedPatient ? "bg-blue-100 text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {p.full_name}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
        <input type="hidden" {...register("patient_id")} />
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
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
          <input
            type="number"
            step="0.1"
            {...register("temperature_c")}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          {...register("notes")}
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Optional"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Adding..." : "Add Reading"}
      </button>
    </form>
  );
}
