"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* App shell — the mobile frame, canvas texture, and aura             */
/* ------------------------------------------------------------------ */

export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-paper canvas-grid">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 canvas-aura" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[460px] flex-col">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                            */
/* ------------------------------------------------------------------ */

type BtnProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "ghost" | "soft";
  full?: boolean;
};

export function Btn({
  variant = "primary",
  full,
  className,
  children,
  type = "button",
  ...props
}: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        "pressable inline-flex h-13 items-center justify-center gap-2 rounded-2xl px-5 text-[0.95rem] font-medium tracking-tight outline-none select-none",
        "focus-visible:ring-3 focus-visible:ring-brand-glow/40 disabled:pointer-events-none disabled:opacity-40",
        full && "w-full",
        variant === "primary" &&
          "bg-brand text-white ring-brand hover:bg-brand-ink",
        variant === "soft" &&
          "bg-brand-wash text-brand-ink hover:bg-brand-wash/70",
        variant === "ghost" &&
          "bg-surface text-ink-soft border border-line hover:border-line2 hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Form field scaffold                                                */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[0.8rem] font-medium tracking-wide text-ink-soft uppercase">
          {label}
        </span>
        {hint ? (
          <span className="text-[0.75rem] text-faint">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

const inputBase =
  "w-full rounded-2xl border border-line bg-surface px-4 text-[1.05rem] text-ink ring-soft transition-all placeholder:text-faint/70 outline-none focus:border-brand focus:ring-3 focus:ring-brand-glow/25";

export function TextField(props: React.ComponentProps<"input">) {
  return <input className={cn(inputBase, "h-13")} {...props} />;
}

/** USD money input with a leading $ adornment. */
export function MoneyField({
  value,
  onValueChange,
  placeholder = "0.00",
  suffix,
}: {
  value: number;
  onValueChange: (n: number) => void;
  placeholder?: string;
  suffix?: string;
}) {
  const [text, setText] = React.useState(value ? String(value) : "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resync only when the external value changes, never on local keystrokes
  React.useEffect(() => {
    const asNum = parseFloat(text || "0");
    if (asNum !== value && document.activeElement !== inputRef.current) {
      setText(value ? String(value) : "");
    }
  }, [value]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-mono text-[1.05rem] text-faint">
        $
      </span>
      <input
        ref={inputRef}
        inputMode="decimal"
        className={cn(inputBase, "nums h-13 pl-9 font-mono", suffix && "pr-16")}
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, "");
          setText(raw);
          onValueChange(parseFloat(raw) || 0);
        }}
      />
      {suffix ? (
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[0.85rem] text-faint">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented control                                                  */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative flex rounded-2xl border border-line bg-secondary p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "pressable relative z-10 flex-1 rounded-xl py-2.5 text-[0.9rem] font-medium tracking-tight transition-colors",
              active
                ? "bg-surface text-ink ring-soft"
                : "text-faint hover:text-ink-soft",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toggle switch                                                      */
/* ------------------------------------------------------------------ */

export function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "pressable relative h-7 w-12 shrink-0 rounded-full border transition-colors",
        checked ? "border-brand bg-brand" : "border-line2 bg-secondary",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Progress dots for the wizard                                       */
/* ------------------------------------------------------------------ */

export function Progress({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static progress track
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            i === current
              ? "w-7 bg-brand"
              : i < current
                ? "w-1.5 bg-brand/40"
                : "w-1.5 bg-line2",
          )}
        />
      ))}
    </div>
  );
}
