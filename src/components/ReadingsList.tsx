"use client";

import { calculateAge, checkBreaches } from "@/lib/thresholds";
import { VitalBadge } from "@/components/VitalBadge";
import { AcknowledgeButton } from "@/components/AcknowledgeButton";
import { deleteReading } from "@/app/actions/readings";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Patient, VitalReading } from "@/lib/thresholds";

function LocalTime({ utcString }: { utcString: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="text-gray-400">…</span>;
  const date = new Date(utcString);
  return <>{date.toLocaleString()}</>;
}

function getPatient(reading: VitalReading): Patient | null {
  const p = reading.patients;
  if (!p) return null;
  if (Array.isArray(p)) return p[0] ?? null;
  return p;
}

export function ReadingsList({ readings }: { readings: VitalReading[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteReading(id);
      setConfirmId(null);
      router.refresh();
    } catch (e: any) {
      alert(e.message ?? "Failed to delete reading");
    } finally {
      setDeletingId(null);
    }
  }

  if (!readings || readings.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        No readings found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded At</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Pressure</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SpO₂</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {readings.map((r) => {
            const breaches = checkBreaches(r);
            const hasBreach = breaches.length > 0 && r.status !== "acknowledged";
            const patient = getPatient(r);
            const age = patient?.date_of_birth ? calculateAge(patient.date_of_birth) : null;
            return (
              <tr
                key={r.id}
                className={hasBreach ? "bg-red-50" : "bg-white"}
              >
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {patient?.full_name ?? "Unknown Patient"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {age != null ? `${age}y` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  <LocalTime utcString={r.recorded_at} />
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {r.heart_rate_bpm != null ? `${r.heart_rate_bpm} bpm` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {r.blood_pressure ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {r.spo2_percent != null ? `${r.spo2_percent}%` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {r.temperature_c != null ? `${r.temperature_c}°C` : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <VitalBadge reading={r} />
                </td>
                <td className="px-4 py-3 text-gray-500 italic max-w-[200px] truncate">
                  {r.notes ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {r.status !== "acknowledged" && (
                      <AcknowledgeButton readingId={r.id} acknowledged={false} />
                    )}
                    {r.status === "acknowledged" && (
                      <span className="text-xs text-gray-500">Acknowledged</span>
                    )}
                    {confirmId === r.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === r.id ? "..." : "Yes, Delete"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(r.id)}
                        className="rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
