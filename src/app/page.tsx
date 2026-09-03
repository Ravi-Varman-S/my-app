import { Suspense } from "react";
import { getReadings } from "./actions/readings";
import { SearchBar } from "@/components/SearchBar";
import { StatusFilter } from "@/components/StatusFilter";
import { ReadingsList } from "@/components/ReadingsList";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage(props: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search, status } = await props.searchParams;

  let readings;
  let error = null;
  try {
    readings = await getReadings(search, status);
  } catch (e: any) {
    error = e.message ?? "Failed to load readings";
    readings = [];
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
              {readings.length} reading{readings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/readings/new"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add Reading
            </Link>
            <Link
              href="/patients/new"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              + Add Patient
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Suspense>
            <SearchBar />
          </Suspense>
          <Suspense>
            <StatusFilter />
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
        ) : readings.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            {search || status ? "No readings match your filters." : "No readings yet. Add a reading to get started."}
          </div>
        ) : (
          <ReadingsList readings={readings as any} />
        )}
      </main>
    </div>
  );
}
