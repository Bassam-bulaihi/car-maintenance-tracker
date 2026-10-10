"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type ComboboxOption = { value: string; label: string; hint?: string };

/**
 * Compact replacement for long native <select>s (the OS dropdown for 50+
 * models was huge and unstyled). A trigger button opens a short panel with
 * type-to-filter (shown when there are enough options to need it) and a
 * scrollable list. Keyboard: ↑/↓ to move, Enter to pick, Esc to close.
 * Submits through a hidden input when `name` is given.
 */
export function Combobox({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  required,
  size = "md",
  className = "",
  mono = false,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  required?: boolean;
  size?: "sm" | "md";
  className?: string;
  mono?: boolean;
}) {
  const autoId = useId();
  const listId = `${id ?? autoId}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchable = options.length > 8;

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => `${o.label} ${o.value} ${o.hint ?? ""}`.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  const openPanel = () => {
    setQuery("");
    setHighlight(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${highlight}"]`)?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const pick = (option: ComboboxOption) => {
    onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openPanel();
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(filtered.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter" && filtered[highlight]) {
      e.preventDefault();
      pick(filtered[highlight]);
    }
  };

  const height = size === "sm" ? "h-10" : "h-12";

  return (
    <div ref={rootRef} className={`relative ${className}`} onKeyDown={onKeyDown}>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={`flex ${height} w-full items-center justify-between gap-2 border border-hairline bg-surface-card px-4 text-start text-sm transition-colors hover:border-on-dark focus-visible:border-on-dark ${
          selected ? "text-on-dark" : "text-muted"
        }`}
      >
        <span className={`truncate ${mono && selected ? "font-mono" : ""}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 border border-hairline bg-canvas shadow-none">
          {searchable && (
            <div className="relative border-b border-hairline">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(0);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                aria-controls={listId}
                className="h-10 w-full bg-transparent pe-3 ps-9 text-sm text-on-dark placeholder:text-muted focus:outline-none"
                dir="auto"
              />
            </div>
          )}
          <ul ref={listRef} id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted">{emptyLabel}</li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    data-index={index}
                    onPointerEnter={() => setHighlight(index)}
                    onClick={() => pick(option)}
                    className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm ${
                      index === highlight ? "bg-surface-elevated text-on-dark" : "text-body"
                    }`}
                  >
                    <span className={`flex min-w-0 items-baseline gap-2 ${mono ? "font-mono" : ""}`}>
                      <span className="truncate">{option.label}</span>
                      {option.hint && <span className="shrink-0 text-xs text-muted" dir="ltr">{option.hint}</span>}
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
