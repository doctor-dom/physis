import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { DISCLAIMER_SHORT } from "../content/disclaimer";

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

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pt-6 pb-14">
      <header className="mb-6">
        <Link to="/" className="group inline-block">
          <h1
            className={`font-bold tracking-wide text-teal-900 group-hover:text-teal-700 ${
              isHome ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl"
            }`}
          >
            P.H.Y.S.I.S.
          </h1>
        </Link>
        {isHome ? (
          <>
            <p className="mt-2 text-sm sm:text-base font-medium text-teal-800">
              Pediatric Height Yields: a Score-based Interpretation System
            </p>
            <p className="mt-2 text-sm leading-relaxed text-teal-700/90 max-w-2xl">
              A TW3-based clinical tool to aid pediatric endocrinologists in the
              interpretation and scoring of pediatric bone age X-rays.
            </p>
          </>
        ) : null}
      </header>
      <main className="flex-1 pb-4">{children}</main>
      <DisclaimerFooter />
    </div>
  );
}
