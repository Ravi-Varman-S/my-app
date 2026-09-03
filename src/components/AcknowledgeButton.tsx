"use client";

import { useTransition } from "react";
import { acknowledgeReading } from "@/app/actions/readings";

export function AcknowledgeButton({
  readingId,
  acknowledged,
}: {
  readingId: string;
  acknowledged: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (acknowledged) {
    return (
      <span className="text-xs text-gray-500">Acknowledged</span>
    );
  }

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await acknowledgeReading(readingId);
        });
      }}
      disabled={isPending}
      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {isPending ? "Saving..." : "Acknowledge"}
    </button>
  );
}
