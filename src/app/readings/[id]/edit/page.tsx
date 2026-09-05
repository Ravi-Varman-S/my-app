import Link from "next/link";
import { getReading } from "@/app/actions/readings";
import { EditReadingForm } from "@/components/EditReadingForm";

export const dynamic = "force-dynamic";

export default async function EditReadingPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let reading = null;
  let error = null;
  try {
    reading = await getReading(id);
  } catch (e: any) {
    error = e.message ?? "Failed to load reading";
  }

  if (error || !reading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back
          </Link>
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-700">Error: {error || "Reading not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center px-4 py-4">
          <div>
            <Link
              href={`/patients/${reading.patient_id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              &larr; Back to {reading.patients?.full_name}
            </Link>
            <h1 className="mt-1 text-xl font-bold text-gray-900">
              Update Reading
            </h1>
            <p className="text-sm text-gray-500">
              {reading.patients?.full_name} &middot;{" "}
              Recorded: {new Date(reading.recorded_at).toLocaleString()}
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <EditReadingForm reading={reading} />
      </main>
    </div>
  );
}
