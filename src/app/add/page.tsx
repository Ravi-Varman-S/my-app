import { getPatients, getPatientWithReadings } from "@/app/actions/patients";
import { AddReadingForm } from "@/components/AddReadingForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AddPage(props: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const { patient: patientId } = await props.searchParams;
  const patients = await getPatients();

  let preSelectedPatient = null;
  if (patientId) {
    try {
      const result = await getPatientWithReadings(patientId);
      preSelectedPatient = result.patient;
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Link
            href={preSelectedPatient ? `/patients/${preSelectedPatient.id}` : "/"}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to {preSelectedPatient?.full_name || "Dashboard"}
          </Link>
          <h1 className="mt-2 text-xl font-bold text-gray-900">
            {preSelectedPatient
              ? `Add Reading for ${preSelectedPatient.full_name}`
              : "Add Patient & Reading"}
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <AddReadingForm
            patients={patients}
            defaultPatientId={preSelectedPatient?.id}
          />
        </div>
      </main>
    </div>
  );
}
