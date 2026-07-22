import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const FAVICON_PHYSIS = "/favicon-physis.png";
const FAVICON_CALC = "/favicon-calc.png";

const PHYSIS_PATHS = new Set(["/", "/growth", "/mph", "/tw3", "/rwt"]);

/** PHYSIS favicon on home and growth workflow; CALCS favicon elsewhere (incl. `/calculators` and tool routes). */
function faviconForPath(pathname: string): string {
  if (PHYSIS_PATHS.has(pathname) || pathname === "/disclaimer") {
    return FAVICON_PHYSIS;
  }
  return FAVICON_CALC;
}

function ensureRouteFaviconLink(): HTMLLinkElement {
  const existing = document.querySelector<HTMLLinkElement>("link[data-route-favicon]");
  if (existing) return existing;

  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.setAttribute("data-route-favicon", "true");
  document.head.appendChild(link);
  return link;
}

export function useRouteFavicon() {
  const { pathname } = useLocation();

  useEffect(() => {
    const link = ensureRouteFaviconLink();
    link.href = faviconForPath(pathname);
  }, [pathname]);
}
