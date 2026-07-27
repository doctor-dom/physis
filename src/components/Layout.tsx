import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { DISCLAIMER_SHORT } from "../content/disclaimer";
import { useRouteFavicon } from "../hooks/useRouteFavicon";

export function DisclaimerFooter() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200/80 bg-white/95 py-1.5 px-3 text-center backdrop-blur-sm shadow-[0_-1px_3px_rgba(0,0,0,0.05)]"
      role="contentinfo"
    >
      <Link
        to="/disclaimer"
        className="mx-auto block max-w-5xl text-[10px] sm:text-xs leading-snug text-red-600 hover:text-red-700 hover:underline underline-offset-2 transition-colors"
      >
        {DISCLAIMER_SHORT}
      </Link>
    </footer>
  );
}

export const BUG_REPORT_URL = "https://github.com/doctor-dom/physis/issues";
export const FEATURE_REQUEST_URL = "https://github.com/doctor-dom/physis/discussions";

function HeaderFeedbackLink({
  href,
  emoji,
  title,
  ariaLabel,
}: {
  href: string;
  emoji: string;
  title: string;
  ariaLabel: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex shrink-0 items-center justify-center rounded-md p-1 transition hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      aria-label={ariaLabel}
      title={title}
    >
      <span className="text-2xl leading-none transition group-hover:scale-110">{emoji}</span>
    </a>
  );
}

export function BugReportLink() {
  return (
    <HeaderFeedbackLink
      href={BUG_REPORT_URL}
      emoji="👾"
      title="Bug reporting"
      ariaLabel="Bug reporting on GitHub"
    />
  );
}

export function FeatureRequestLink() {
  return (
    <HeaderFeedbackLink
      href={FEATURE_REQUEST_URL}
      emoji="📢"
      title="Feature request"
      ariaLabel="Feature request on GitHub Discussions"
    />
  );
}

export function HeaderFeedbackLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex shrink-0 flex-col items-center ${className}`}>
      <span className="text-[10px] font-medium leading-none text-teal-700">GitHub</span>
      <div className="mt-0.5 flex items-center gap-0">
        <BugReportLink />
        <FeatureRequestLink />
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useRouteFavicon();

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pt-6 pb-14">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <Link to="/" className="group inline-block min-w-0">
            <h1
              className={`font-bold tracking-wide text-teal-900 group-hover:text-teal-700 ${
                isHome ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl"
              }`}
            >
              P.H.Y.S.I.S. C.A.L.C.S.
            </h1>
          </Link>
          <HeaderFeedbackLinks className="mt-0.5 sm:mt-1" />
        </div>
        {isHome ? (
          <>
            <p className="mt-2 text-sm sm:text-base font-medium text-teal-800">
              Pediatric Height Yielded through Skeletal Interpretation System
            </p>
            <p className="mt-1 text-sm sm:text-base font-medium text-teal-800">
              Comprehensive Action-Leveraging Calculator Suite
            </p>
          </>
        ) : null}
      </header>
      <main className="flex-1 pb-4">{children}</main>
      <DisclaimerFooter />
    </div>
  );
}
