"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateReading } from "@/app/actions/readings";

interface Reading {
  id: string;
  patient_id: string;
  heart_rate_bpm: number | null;
  blood_pressure: string | null;
  spo2_percent: number | null;
  temperature_c: number | null;
  notes: string | null;
  patients?: { full_name: string };
}

export function EditReadingForm({ reading }: { reading: Reading }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [heartRate, setHeartRate] = useState(
    reading.heart_rate_bpm?.toString() ?? ""
  );
  const [bloodPressure, setBloodPressure] = useState(
    reading.blood_pressure ?? ""
  );
  const [spo2, setSpo2] = useState(
    reading.spo2_percent?.toString() ?? ""
  );
  const [temperature, setTemperature] = useState(
    reading.temperature_c?.toString() ?? ""
  );
  const [notes, setNotes] = useState(reading.notes ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!heartRate.trim()) {
      setError("Heart rate is required");
      return;
    }

    const hr = Number(heartRate);
    if (isNaN(hr) || hr < 20 || hr > 300) {
      setError("Heart rate must be between 20 and 300 bpm");
      return;
    }

    if (bloodPressure.trim()) {
      const bpParts = bloodPressure.split("/");
      if (bpParts.length !== 2) {
        setError("Blood pressure must be in format like 120/80");
        return;
      }
      const sys = Number(bpParts[0]);
      const dia = Number(bpParts[1]);
      if (isNaN(sys) || isNaN(dia)) {
        setError("Blood pressure must have valid numbers");
        return;
      }
      if (sys <= dia) {
        setError("Systolic must be higher than diastolic");
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateReading(reading.id, {
        heart_rate_bpm: hr,
        blood_pressure: bloodPressure.trim() || null,
        spo2_percent: spo2 ? Number(spo2) : null,
        temperature_c: temperature ? Number(temperature) : null,
        notes: notes.trim() || null,
      });
      router.push(`/patients/${reading.patient_id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Failed to update reading");
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-md bg-blue-50 p-3">
        <p className="text-sm font-medium text-blue-800">
          Updating reading for: <span className="font-bold">{reading.patients?.full_name}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Heart Rate (bpm) *
        </label>
        <input
          type="number"
          value={heartRate}
          onChange={(e) => setHeartRate(e.target.value)}
          placeholder="e.g. 72"
          min={20}
          max={300}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Normal: 50-120 bpm</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Blood Pressure (e.g. 120/80)
        </label>
        <input
          type="text"
          value={bloodPressure}
          onChange={(e) => setBloodPressure(e.target.value)}
          placeholder="e.g. 120/80"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Normal: 90-180 / 60-120</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            SpO₂ (%)
          </label>
          <input
            type="number"
            value={spo2}
            onChange={(e) => setSpo2(e.target.value)}
            placeholder="e.g. 98"
            min={50}
            max={100}
            step={0.1}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Normal: ≥90%</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Temperature (°C)
          </label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="e.g. 37"
            min={30}
            max={45}
            step={0.1}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Normal: 35-39°C</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes about this reading"
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Update Reading"}
        </button>
        <Link
          href={`/patients/${reading.patient_id}`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
