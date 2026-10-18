"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface AutocompleteComboboxProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | ComboboxOption)[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  allowCustom?: boolean;
  className?: string;
  hint?: string;
}

export default function AutocompleteCombobox({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Type to search...",
  required = false,
  disabled = false,
  allowCustom = true,
  className = "",
  hint,
}: AutocompleteComboboxProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const normalizedOptions: ComboboxOption[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const filteredOptions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalizedOptions;

    return normalizedOptions.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchValue = opt.value.toLowerCase().includes(q);
      const matchSub = opt.sublabel?.toLowerCase().includes(q) || false;
      const matchBadge = opt.badge?.toLowerCase().includes(q) || false;
      return matchLabel || matchValue || matchSub || matchBadge;
    });
  }, [normalizedOptions, query]);

  const hasExactMatch = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return filteredOptions.some(
      (opt) => opt.value.toLowerCase() === q || opt.label.toLowerCase() === q
    );
  }, [filteredOptions, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (allowCustom && query !== value) {
          onChange(query.trim());
        } else if (!allowCustom && !hasExactMatch) {
          setQuery(value);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [allowCustom, query, value, hasExactMatch, onChange]);

  const handleSelect = (val: string) => {
    setQuery(val);
    onChange(val);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(filteredOptions.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }
    } else if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightedIndex].value);
      } else if (allowCustom && query.trim()) {
        e.preventDefault();
        handleSelect(query.trim());
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-black/80"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3 text-black/40 pointer-events-none">
          <Search className="w-3.5 h-3.5" />
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={query}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            const nextVal = e.target.value;
            setQuery(nextVal);
            setIsOpen(true);
            setHighlightedIndex(-1);
            if (allowCustom) {
              onChange(nextVal);
            }
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className="w-full text-xs border border-black/25 bg-white pl-9 pr-16 py-2.5 focus:outline-none focus:border-black font-sans transition-colors placeholder:text-black/35 disabled:bg-black/5 disabled:cursor-not-allowed"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {query && !disabled && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("");
                inputRef.current?.focus();
              }}
              className="p-1 text-black/40 hover:text-black transition-colors cursor-pointer"
              title="Clear"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setIsOpen((prev) => !prev);
              inputRef.current?.focus();
            }}
            className="p-1 text-black/40 hover:text-black transition-colors cursor-pointer"
            title="Toggle dropdown"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {hint && <p className="text-[10px] text-black/50 mt-1">{hint}</p>}

      {/* Floating Suggestions Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-black shadow-lg max-h-56 overflow-y-auto">
          {allowCustom && query.trim() && !hasExactMatch && (
            <div
              onClick={() => handleSelect(query.trim())}
              className="px-3 py-2 text-xs border-b border-black/10 bg-black/[0.03] hover:bg-black hover:text-white cursor-pointer transition-colors flex items-center justify-between group"
            >
              <span className="font-semibold truncate">
                Add custom: <span className="underline italic">"{query.trim()}"</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-black/50 group-hover:text-white/80 font-mono">
                [Enter]
              </span>
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-3 py-3 text-xs text-black/50 text-center italic">
              {allowCustom ? "Press Enter to use custom value" : "No matches found"}
            </div>
          ) : (
            <ul ref={listRef} className="py-1 divide-y divide-black/5">
              {filteredOptions.map((opt, idx) => {
                const isSelected =
                  opt.value.toLowerCase() === value.trim().toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={`${opt.value}-${idx}`}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isHighlighted
                        ? "bg-black text-white"
                        : isSelected
                        ? "bg-black/10 text-black font-semibold"
                        : "text-black hover:bg-black/5"
                    }`}
                  >
                    <span className="truncate pr-2 font-medium">{opt.label}</span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 uppercase tracking-wider font-mono ${
                            isHighlighted
                              ? "bg-white/20 text-white"
                              : "bg-black/10 text-black/70"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            isHighlighted ? "text-white" : "text-black"
                          }`}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
