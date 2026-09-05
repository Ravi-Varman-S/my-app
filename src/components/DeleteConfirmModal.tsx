"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface DeleteConfirmModalProps {
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
  label?: string;
}

export function DeleteConfirmModal({
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this? This action cannot be undone.",
  label = "Delete",
}: DeleteConfirmModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        {label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative mx-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
