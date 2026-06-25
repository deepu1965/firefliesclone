"use client";

import { useUiStore } from "@/stores/uiStore";

const TOAST_COLORS = {
  success: "border-l-4 border-[#10B981] bg-white shadow-lg",
  error: "border-l-4 border-[#EF4444] bg-white shadow-lg",
  info: "border-l-4 border-ff-accent bg-white shadow-lg",
};

const TOAST_TEXT = {
  success: "text-ff-text-body",
  error: "text-ff-text-body",
  info: "text-ff-text-body",
};

export function ToastContainer() {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-xl min-w-[280px] max-w-[380px] ${TOAST_COLORS[toast.type]}`}
        >
          <p className={`text-xs flex-1 leading-relaxed ${TOAST_TEXT[toast.type]}`}>
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-ff-text-dim hover:text-ff-text-body transition-colors shrink-0 mt-0.5"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
