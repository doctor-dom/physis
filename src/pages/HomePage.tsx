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
            Primary workflow
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
            Additional workflows
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-teal-900">
            Other clinical calculators useful to pediatric endocrinologists
          </h2>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-teal-700">
            View calculators →
          </span>
        </Link>
      </section>
    </div>
  );
}
