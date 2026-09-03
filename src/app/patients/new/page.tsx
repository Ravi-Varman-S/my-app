import { AddPatientForm } from "@/components/AddPatientForm";
import Link from "next/link";

export default function NewPatientPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="mt-2 text-xl font-bold text-gray-900">
            Add Patient
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <AddPatientForm />
        </div>
      </main>
    </div>
  );
}
