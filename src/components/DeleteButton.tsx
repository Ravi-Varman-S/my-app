"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  onConfirm: () => Promise<void>;
  label?: string;
}

export function DeleteButton({ onConfirm, label = "Delete" }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    const confirmed = window.confirm("Are you sure you want to delete this?");
    if (!confirmed) return;

    startTransition(async () => {
      await onConfirm();
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : label}
    </button>
  );
}
