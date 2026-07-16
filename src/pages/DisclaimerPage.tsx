import { Link } from "react-router-dom";
import { DISCLAIMER_PARAGRAPHS } from "../content/disclaimer";

export default function DisclaimerPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-teal-900">Disclaimer</h2>
        <p className="mt-1 text-sm text-teal-700/80">
          Please read before using PHYSIS.
        </p>
      </div>

      <div className="rounded-xl border border-teal-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        {DISCLAIMER_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-relaxed text-teal-900">
            {paragraph}
          </p>
        ))}
      </div>

      <Link
        to="/"
        className="inline-flex text-sm font-medium text-teal-700 hover:text-teal-900 underline-offset-2 hover:underline"
      >
        ← Back to PHYSIS
      </Link>
    </div>
  );
}
