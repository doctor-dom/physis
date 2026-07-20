import { Link } from "react-router-dom";
import {
  OTHER_CLINICAL_CALCULATORS_PATH,
  PRIMARY_WORKFLOW,
} from "../App";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section>
        <Link
          to={PRIMARY_WORKFLOW.path}
          className="block rounded-2xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-white p-6 sm:p-8 shadow-md transition hover:border-teal-400 hover:shadow-lg"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">
            Primary Workflow - PHYSIS
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-teal-900">
            {PRIMARY_WORKFLOW.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-teal-800/90 leading-relaxed max-w-2xl">
            {PRIMARY_WORKFLOW.description}
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-teal-700">
            Open workflow →
          </span>
        </Link>
      </section>

      <section>
        <Link
          to={OTHER_CLINICAL_CALCULATORS_PATH}
          className="block rounded-2xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-white p-6 sm:p-8 shadow-md transition hover:border-teal-400 hover:shadow-lg"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">
            Additional Workflow - CALCS
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-teal-900">
            Clinical calculators useful pediatric endocrinology
          </h2>
          <p className="mt-3 text-sm sm:text-base text-teal-800/90 leading-relaxed max-w-2xl">
            Suite of calculators tools that are clinically useful to pediatric endocrinologists
            covering a wide range of topics, ie. Auxology, Electrolytes, Glucose dynamics, BSA, etc.
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-teal-700">
            View calculators →
          </span>
        </Link>
      </section>
    </div>
  );
}
