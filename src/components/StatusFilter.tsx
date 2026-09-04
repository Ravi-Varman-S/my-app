"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const STATUS_OPTIONS = [
  { value: "all", label: "All Readings" },
  { value: "pending", label: "Pending" },
  { value: "acknowledged", label: "Acknowledged" },
];

export function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = searchParams.get("status") ?? "all";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    startTransition(() => {
      router.replace(`/?${params.toString()}`);
    });
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
