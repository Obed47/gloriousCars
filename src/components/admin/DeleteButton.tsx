"use client";

export function DeleteButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(`Delete ${label}? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
      className="text-[0.8125rem] font-semibold text-red-600 hover:underline"
    >
      Delete
    </button>
  );
}
