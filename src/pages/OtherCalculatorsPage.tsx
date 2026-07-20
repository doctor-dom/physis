import { Link } from "react-router-dom";
import {
  OTHER_CLINICAL_CALCULATOR_GROUPS,
  OTHER_CLINICAL_CALCULATORS,
} from "../App";

export default function OtherCalculatorsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← Back to home
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-teal-900">
          Other clinical calculators
        </h2>
      </div>

      {OTHER_CLINICAL_CALCULATOR_GROUPS.length > 0 ? (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
            Calculator collections
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {OTHER_CLINICAL_CALCULATOR_GROUPS.map((group) => (
              <Link
                key={group.path}
                to={group.path}
                className="flex min-w-0 flex-col rounded-xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-white p-3 shadow-md transition hover:border-teal-400 hover:shadow-lg sm:rounded-2xl sm:p-4"
              >
                <h3 className="text-sm font-bold leading-snug text-teal-900 sm:text-base">
                  {group.title}
                </h3>
                <p className="mt-1.5 flex-1 text-[11px] leading-snug text-teal-800/90 sm:mt-2 sm:text-xs">
                  {group.description}
                </p>
                <span className="mt-2 inline-flex items-center text-[11px] font-semibold text-teal-700 sm:mt-3 sm:text-xs">
                  View list →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
          Individual calculators
        </p>
        <ul className="divide-y divide-teal-100 rounded-xl border border-teal-100 bg-white shadow-sm">
          {OTHER_CLINICAL_CALCULATORS.map((calc) => (
            <li key={calc.path}>
              <Link
                to={calc.path}
                className="block px-4 py-4 transition hover:bg-teal-50/80 first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="font-medium text-teal-900">{calc.title}</span>
                <span className="mt-0.5 block text-sm text-teal-700/80">
                  {calc.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
