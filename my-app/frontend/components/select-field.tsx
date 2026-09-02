"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

// Sentinel used internally so base-ui Select never receives an empty string
// as a value (which it treats as "no selection"). Pages still work with "".
const EMPTY = "__empty__";

interface SelectFieldProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  className?: string;
  disabled?: boolean;
}

export function SelectField({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
}: SelectFieldProps) {
  const hasEmptyOption = options.some((o) => o.value === "");
  const selectValue =
    value === "" ? (hasEmptyOption ? EMPTY : null) : value;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => onValueChange(v === EMPTY ? "" : ((v as string) ?? ""))}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn("w-full min-w-0", className)}>
        <SelectValue placeholder={placeholder} className="min-w-0">
          {(v: string | null) => {
            const real = v === EMPTY ? "" : (v ?? "");
            const opt = options.find((o) => o.value === real);
            return (
              <span className="block min-w-0 truncate">
                {opt ? (
                  opt.label
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </span>
            );
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value || EMPTY} value={o.value === "" ? EMPTY : o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
