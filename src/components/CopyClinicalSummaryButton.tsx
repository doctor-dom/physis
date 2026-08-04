import { useState } from "react";

interface CopyClinicalSummaryButtonProps {
  summary: string | null;
  className?: string;
  /** When false (default), only the copy button is shown. */
  showPreview?: boolean;
  /** Idle button label (copied state still shows “Copied to clipboard”). */
  buttonLabel?: string;
}

export default function CopyClinicalSummaryButton({
  summary,
  className = "",
  showPreview = false,
  buttonLabel = "Copy for clinical documentation",
}: CopyClinicalSummaryButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!summary) {
    return null;
  }

  const summaryText = summary;

  async function handleCopy() {
    setError(null);
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed — please try again.");
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg border border-teal-300 bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm transition hover:border-teal-500 hover:bg-teal-50"
      >
        {copied ? "Copied to clipboard" : buttonLabel}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
      {showPreview && (
        <p className="rounded-lg border border-teal-100 bg-teal-50/50 p-3 text-xs leading-relaxed text-teal-900">
          {summary}
        </p>
      )}
    </div>
  );
}
