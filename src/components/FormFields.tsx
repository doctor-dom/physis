import { useState, type KeyboardEvent, type ReactNode } from "react";

export function InfoTooltip({ text, wide = false }: { text: string; wide?: boolean }) {
  return (
    <span className="group/info relative ml-1.5 inline-flex align-middle">
      <span
        tabIndex={0}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-teal-300 bg-teal-50 text-[10px] font-bold leading-none text-teal-700"
        aria-label="More information"
      >
        i
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none invisible absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 rounded-lg border border-teal-200 bg-white p-2.5 text-xs font-normal leading-relaxed text-teal-800 opacity-0 shadow-lg transition-opacity group-hover/info:visible group-hover/info:opacity-100 group-focus-within/info:visible group-focus-within/info:opacity-100 ${
          wide
            ? "w-80 max-w-[min(20rem,calc(100vw-2rem))] whitespace-pre-line"
            : "w-72 max-w-[min(18rem,calc(100vw-2rem))]"
        }`}
      >
        {text}
      </span>
    </span>
  );
}

export function Field({
  label,
  hint,
  labelTooltip,
  labelTooltipWide = false,
  children,
}: {
  label: string;
  hint?: string;
  labelTooltip?: string;
  labelTooltipWide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-teal-900">
        {label}
        {labelTooltip ? (
          <InfoTooltip text={labelTooltip} wide={labelTooltipWide} />
        ) : null}
      </span>
      {hint && (
        <span className="block whitespace-pre-line text-xs text-teal-700/70">{hint}</span>
      )}
      {children}
    </label>
  );
}

export function DecimalTextInput({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      className="w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  min,
  step = "any",
  placeholder,
  disabled = false,
  readOnly = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  min?: number;
  step?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  return (
    <input
      type="number"
      className={`w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:border-teal-100 disabled:bg-teal-50/70 disabled:text-teal-700/80 ${
        readOnly
          ? "cursor-default border-teal-300 bg-teal-50/90 text-teal-950 focus:border-teal-300 focus:ring-teal-100"
          : "border-teal-200 bg-white text-teal-900 focus:border-teal-500 focus:ring-teal-200"
      }`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      min={min}
      step={step}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className="w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-teal-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function ResultCard({
  title,
  titleTooltip,
  value,
  interpretation,
  warning,
  error,
}: {
  title: string;
  titleTooltip?: string;
  value?: string;
  interpretation?: string;
  warning?: string;
  error?: string;
}) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-medium">{title}</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-teal-700">
        {title}
        {titleTooltip ? <InfoTooltip text={titleTooltip} /> : null}
      </p>
      {value && <p className="mt-1 text-2xl font-bold text-teal-900">{value}</p>}
      {interpretation && (
        <p className="mt-2 text-sm text-teal-800">{interpretation}</p>
      )}
      {warning && (
        <p className="mt-2 text-sm text-amber-800 bg-amber-50 rounded-lg p-2 border border-amber-100">
          {warning}
        </p>
      )}
    </div>
  );
}

export function CalculatorReferenceFooter({ children }: { children: ReactNode }) {
  return <p className="text-xs text-teal-600">{children}</p>;
}

export function ClinicalGuidanceBanner({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-2 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-sm text-teal-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
        Clinical guidance
      </p>
      {lines.map((line) => (
        <p key={line} className="text-xs leading-relaxed text-teal-700">
          {line}
        </p>
      ))}
    </div>
  );
}

export function SharedGuidanceBannerGroup({
  sections,
}: {
  sections: { id: string; title: string; lines: string[] }[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeSection = sections.find((section) => section.id === activeId);

  return (
    <div className="overflow-hidden rounded-xl border border-teal-100 bg-teal-50/60">
      <div
        className="flex flex-wrap divide-x divide-teal-100 border-b border-teal-100"
        role="tablist"
        aria-label="Calculator guidance"
      >
        {sections.map((section) => {
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`guidance-panel-${section.id}`}
              id={`guidance-tab-${section.id}`}
              onClick={() => setActiveId(isActive ? null : section.id)}
              className={`min-w-0 flex-1 px-3 py-2.5 text-left text-xs font-medium transition sm:text-sm ${
                isActive
                  ? "bg-white text-teal-900"
                  : "bg-teal-50/60 text-teal-700 hover:bg-teal-50"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                {section.title}
                <span
                  className={`text-[10px] text-teal-500 transition-transform ${isActive ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {activeSection ? (
        <div
          id={`guidance-panel-${activeSection.id}`}
          role="tabpanel"
          aria-labelledby={`guidance-tab-${activeSection.id}`}
          className="space-y-2 bg-white px-4 py-3"
        >
          {activeSection.lines.map((line) => (
            <p key={line} className="text-xs leading-relaxed text-teal-700">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Single collapsible panel, collapsed by default (e.g. unrounded calculation details). */
export function CollapsibleGuidancePanel({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-teal-100 bg-teal-50/60">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-xs font-medium text-teal-700 transition hover:bg-teal-50 sm:text-sm"
      >
        {title}
        <span
          className={`text-[10px] text-teal-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open ? (
        <div className="space-y-1 border-t border-teal-100 bg-white px-4 py-3">
          {lines.map((line) => (
            <p key={line} className="text-xs leading-relaxed text-teal-700">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CalculatorShell({
  title,
  description,
  formula,
  descriptionAction,
  formulaAction,
  children,
}: {
  title: string;
  /** Brief scope or use of the tool (shown under the title). */
  description?: string;
  /** @deprecated Use `description` instead. */
  formula?: string;
  descriptionAction?: ReactNode;
  /** @deprecated Use `descriptionAction` instead. */
  formulaAction?: ReactNode;
  children: ReactNode;
}) {
  const bannerText = description ?? formula;
  const bannerAction = descriptionAction ?? formulaAction;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-teal-900">{title}</h2>
        {bannerText && (
          <div className="mt-1 flex flex-col gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="min-w-0 text-sm text-teal-800">{bannerText}</p>
            {bannerAction ? <div className="shrink-0">{bannerAction}</div> : null}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
