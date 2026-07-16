import { useCallback, useEffect, useState } from "react";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ZoomableImage({ src, alt, className = "" }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full cursor-zoom-in text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-lg"
        aria-label={`${alt} — click to enlarge`}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full rounded-lg border border-teal-100 pointer-events-none ${className}`}
        />
        <span
          className="absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          Tap to zoom
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/85 cursor-zoom-out"
            onClick={close}
            aria-label="Close zoomed image"
          />
          <div className="relative z-10 flex max-h-full max-w-full flex-col items-center gap-3">
            <img
              src={src}
              alt={alt}
              className="max-h-[min(90vh,1200px)] max-w-[min(95vw,1400px)] object-contain rounded-lg shadow-2xl"
            />
            <p className="max-w-prose text-center text-sm text-white/90">{alt}</p>
            <button
              type="button"
              onClick={close}
              className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
