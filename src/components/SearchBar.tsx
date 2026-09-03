"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(
    (term: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
          params.set("search", term);
        } else {
          params.delete("search");
        }
        router.replace(`/?${params.toString()}`);
      }, 300);
    },
    [router, searchParams]
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search by patient name..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <svg
        className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
