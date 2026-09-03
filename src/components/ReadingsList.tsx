"use client";

import { calculateAge, checkBreaches } from "@/lib/thresholds";
import { VitalBadge } from "@/components/VitalBadge";
import { AcknowledgeButton } from "@/components/AcknowledgeButton";
import type { VitalReading } from "@/lib/thresholds";

function formatLocalTime(utcString: string) {
  const date = new Date(utcString);
  return date.toLocaleString();
}

export function ReadingsList({ readings }: { readings: VitalReading[] }) {
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
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {readings.map((r) => {
            const breaches = checkBreaches(r);
            const hasBreach = breaches.length > 0 && r.status !== "acknowledged";
            const age = r.patients?.date_of_birth ? calculateAge(r.patients.date_of_birth) : null;
            return (
              <tr
                key={r.id}
                className={hasBreach ? "bg-red-50" : "bg-white"}
              >
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {r.patients?.full_name ?? "Unknown Patient"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {age != null ? `${age}y` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {formatLocalTime(r.recorded_at)}
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
                  {r.status !== "acknowledged" && (
                    <AcknowledgeButton readingId={r.id} acknowledged={false} />
                  )}
                  {r.status === "acknowledged" && (
                    <span className="text-xs text-gray-500">Acknowledged</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
