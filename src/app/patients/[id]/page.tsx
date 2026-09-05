import Link from "next/link";
import { getPatientWithReadings } from "@/app/actions/patients";
import { AcknowledgeButton } from "@/components/AcknowledgeButton";
import { checkBreaches, parseBloodPressure } from "@/lib/thresholds";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let patient = null;
  let readings: any[] = [];
  let error = null;
  try {
    const result = await getPatientWithReadings(id);
    patient = result.patient;
    readings = result.readings;
  } catch (e: any) {
    error = e.message ?? "Failed to load patient";
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Patients
          </Link>
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-700">Error: {error || "Patient not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  const age = patient.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:underline"
            >
              &larr; Back to Patients
            </Link>
            <h1 className="mt-1 text-xl font-bold text-gray-900">
              {patient.full_name}
            </h1>
            <p className="text-sm text-gray-500">
              {age !== null ? `Age: ${age}y` : ""} &middot;{" "}
              DOB: {new Date(patient.date_of_birth).toLocaleDateString()} &middot;{" "}
              {readings.length} reading{readings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href={`/add?patient=${patient.id}`}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Reading
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {readings.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            No readings yet for this patient.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Recorded At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Heart Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Blood Pressure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    SpO₂
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Temp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {readings.map((reading: any) => {
                  const breaches = checkBreaches(reading);
                  const hasBreaches = breaches.length > 0;

                  return (
                    <tr
                      key={reading.id}
                      className={hasBreaches ? "bg-red-50" : ""}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(reading.recorded_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={
                            breaches.some((b) => b.field === "heart_rate_bpm")
                              ? "font-semibold text-red-600"
                              : "text-gray-600"
                          }
                        >
                          {reading.heart_rate_bpm} bpm
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={
                            breaches.some((b) => b.field === "bp_systolic" || b.field === "bp_diastolic")
                              ? "font-semibold text-red-600"
                              : "text-gray-600"
                          }
                        >
                          {reading.blood_pressure}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={
                            breaches.some((b) => b.field === "spo2_percent")
                              ? "font-semibold text-red-600"
                              : "text-gray-600"
                          }
                        >
                          {reading.spo2_percent != null
                            ? `${reading.spo2_percent}%`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={
                            breaches.some((b) => b.field === "temperature_c")
                              ? "font-semibold text-red-600"
                              : "text-gray-600"
                          }
                        >
                          {reading.temperature_c != null
                            ? `${reading.temperature_c}°C`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {hasBreaches ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            CRITICAL
                          </span>
                        ) : reading.status === "acknowledged" ? (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            Acknowledged
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {reading.notes || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Link
                            href={`/readings/${reading.id}/edit`}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                          {reading.status === "pending" && (
                            <AcknowledgeButton readingId={reading.id} acknowledged={false} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
