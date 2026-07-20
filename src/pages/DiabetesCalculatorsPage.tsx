import { Link } from "react-router-dom";
import { DIABETES_CALCULATORS, OTHER_CLINICAL_CALCULATORS_PATH } from "../App";

export default function DiabetesCalculatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          to={OTHER_CLINICAL_CALCULATORS_PATH}
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          ← Back to other clinical calculators
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-teal-900">Diabetes</h2>
        <p className="mt-2 text-sm text-teal-800/90">
          Diabetes-related clinical tools and calculators.
        </p>
      </div>

      <ul className="divide-y divide-teal-100 rounded-xl border border-teal-100 bg-white shadow-sm">
        {DIABETES_CALCULATORS.map((calc) => (
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
    </div>
  );
}
