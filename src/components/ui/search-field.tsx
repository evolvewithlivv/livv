"use client";

import { Search, X } from "lucide-react";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  autoFocus?: boolean;
};

/**
 * Clean single-pill search — Google-style.
 * Overrides global .livv-page input border/background so only the outer pill shows.
 */
export function SearchField({
  value,
  onChange,
  placeholder = "Search…",
  "aria-label": ariaLabel = "Search",
  className = "",
  autoFocus = false,
}: SearchFieldProps) {
  return (
    <label
      className={
        "livv-search-field flex w-full items-center gap-3 rounded-full " +
        "bg-[color-mix(in_srgb,rgb(var(--livv-ink))_8%,transparent)] " +
        "px-4 py-3 " +
        "transition-colors " +
        "focus-within:bg-[color-mix(in_srgb,rgb(var(--livv-ink))_12%,transparent)] " +
        (className ? ` ${className}` : "")
      }
    >
      <Search size={18} strokeWidth={1.75} className="shrink-0 text-livv-muted" aria-hidden />
      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        className="livv-search-input min-w-0 flex-1 p-0 text-[16px] leading-normal tracking-[-.01em] text-[rgb(var(--livv-ink))] placeholder:text-livv-muted"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-livv-muted transition active:bg-[color-mix(in_srgb,rgb(var(--livv-ink))_10%,transparent)]"
          aria-label="Clear search"
        >
          <X size={15} strokeWidth={2} />
        </button>
      ) : null}
    </label>
  );
}
