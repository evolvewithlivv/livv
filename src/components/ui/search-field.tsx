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
 * Responsive search field — full-width pill on mobile, refined on larger screens.
 * 16px text on mobile avoids iOS zoom; clear control appears when value is set.
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
        "group relative flex w-full min-h-11 items-center gap-2.5 rounded-full border border-livv-border " +
        "bg-[color-mix(in_srgb,rgb(var(--livv-ink))_4%,transparent)] " +
        "px-3.5 py-2.5 sm:min-h-12 sm:gap-3 sm:px-4 sm:py-3 " +
        "transition-[border-color,background-color] " +
        "focus-within:border-[color-mix(in_srgb,rgb(var(--livv-ink))_28%,transparent)] " +
        "focus-within:bg-[color-mix(in_srgb,rgb(var(--livv-ink))_6%,transparent)] " +
        (className ? ` ${className}` : "")
      }
    >
      <Search
        size={16}
        strokeWidth={1.8}
        className="shrink-0 text-livv-muted sm:size-[17px]"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        className={
          "min-w-0 flex-1 bg-transparent text-[16px] leading-none tracking-[-.01em] " +
          "text-[rgb(var(--livv-ink))] outline-none " +
          "placeholder:text-livv-muted " +
          "sm:text-[15px] " +
          "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        }
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className={
            "grid h-7 w-7 shrink-0 place-items-center rounded-full " +
            "text-livv-muted transition hover:bg-[color-mix(in_srgb,rgb(var(--livv-ink))_8%,transparent)] " +
            "hover:text-[rgb(var(--livv-ink))] sm:h-8 sm:w-8"
          }
          aria-label="Clear search"
        >
          <X size={14} strokeWidth={2} />
        </button>
      ) : null}
    </label>
  );
}
