import { Suspense } from "react";
import { getPatients, deletePatient } from "./actions/patients";
import { SearchBar } from "@/components/SearchBar";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage(props: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await props.searchParams;

  let patients;
  let error = null;
  try {
    patients = await getPatients(search);
  } catch (e: any) {
    error = e.message ?? "Failed to load patients";
    patients = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Vital Signs Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              {patients.length} patient{patients.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/add"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add Patient & Reading
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-700">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : patients.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            {search ? "No patients match your search." : "No patients yet. Add a patient to get started."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Readings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Latest Reading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {patients.map((patient: any) => {
                  const age = patient.date_of_birth
                    ? Math.floor(
                        (Date.now() - new Date(patient.date_of_birth).getTime()) /
                          (365.25 * 24 * 60 * 60 * 1000)
                      )
                    : null;

                  const latest = patient.latestReading;
                  const latestTime = latest?.recorded_at
                    ? new Date(latest.recorded_at).toLocaleString()
                    : "—";

                  const latestBreaches = patient.latestBreaches ?? [];
                  const latestHasBreach = latestBreaches.length > 0;

                  return (
                    <tr
                      key={patient.id}
                      className={`transition-colors hover:bg-blue-50 ${
                        latestHasBreach ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {patient.full_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {age !== null ? `${age}y` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {patient.totalReadings}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {patient.pendingCount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            {patient.pendingCount} pending
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {latestTime}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {latestHasBreach ? (
                          <div className="flex flex-wrap gap-1">
                            {latestBreaches.map((b: any, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                              >
                                {b.label}: {b.value}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <DeleteConfirmModal
                          onConfirm={async () => {
                            "use server";
                            await deletePatient(patient.id);
                          }}
                          title="Delete Patient"
                          message={`Are you sure you want to delete "${patient.full_name}"? All their readings will also be deleted.`}
                          label="Delete Patient"
                        />
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
