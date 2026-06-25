"use client";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message = "Something went wrong.", onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 6v4M9 13v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="9" cy="9" r="7.5" stroke="#EF4444" strokeWidth="1.5" />
        </svg>
      </div>
      <div>
        <p className="text-sm text-ff-text-body">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-ff-accent hover:text-ff-accent-light transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
