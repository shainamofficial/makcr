import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
  [key: string]: any;
}

interface Props {
  value: string;
  onChange: (value: string, option?: Option) => void;
  searchFn: (query: string) => Promise<Option[]>;
  placeholder?: string;
  className?: string;
}

export default function AutocompleteInput({ value, onChange, searchFn, placeholder, className }: Props) {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    if (query.length < 2) { setOptions([]); return; }
    const t = setTimeout(async () => {
      const res = await searchFn(query);
      setOptions(res);
      setOpen(res.length > 0);
    }, 300);
    return () => clearTimeout(t);
  }, [query, searchFn]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
              onClick={() => {
                setQuery(opt.label);
                onChange(opt.label, opt);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
