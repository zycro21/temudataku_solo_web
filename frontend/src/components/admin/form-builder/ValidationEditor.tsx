"use client";

import {
  ALLOWED_VALIDATION_KINDS,
  defaultRule,
  type ItemType,
  type ValidationRule,
} from "./editorModel";

interface Props {
  type: ItemType;
  rule: ValidationRule | null;
  onChange: (rule: ValidationRule | null) => void;
}

const KIND_LABEL: Record<ValidationRule["kind"], string> = {
  number: "Angka",
  text: "Teks",
  length: "Panjang teks",
  regex: "Regular expression",
  selectCount: "Jumlah pilihan",
};

const OPS: Record<ValidationRule["kind"], { value: string; label: string }[]> =
  {
    number: [
      { value: "between", label: "Di antara" },
      { value: "notBetween", label: "Tidak di antara" },
      { value: "gt", label: "Lebih besar dari" },
      { value: "gte", label: "Lebih besar atau sama dengan" },
      { value: "lt", label: "Lebih kecil dari" },
      { value: "lte", label: "Lebih kecil atau sama dengan" },
      { value: "eq", label: "Sama dengan" },
      { value: "neq", label: "Tidak sama dengan" },
      { value: "integer", label: "Bilangan bulat" },
    ],
    text: [
      { value: "email", label: "Alamat email" },
      { value: "url", label: "URL" },
      { value: "contains", label: "Mengandung kata" },
      { value: "notContains", label: "Tidak mengandung kata" },
    ],
    length: [
      { value: "min", label: "Minimal karakter" },
      { value: "max", label: "Maksimal karakter" },
    ],
    regex: [
      { value: "matches", label: "Cocok dengan pola" },
      { value: "notMatches", label: "Tidak cocok dengan pola" },
    ],
    selectCount: [
      { value: "atLeast", label: "Pilih minimal" },
      { value: "atMost", label: "Pilih maksimal" },
      { value: "exactly", label: "Pilih tepat" },
    ],
  };

const fieldClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

function NumInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? undefined : Number(e.target.value))
      }
      placeholder={placeholder}
      aria-label={label}
      className={`${fieldClass} w-32`}
    />
  );
}

export default function ValidationEditor({ type, rule, onChange }: Props) {
  const kinds = ALLOWED_VALIDATION_KINDS[type];
  if (!kinds) return null;

  const set = (patch: Partial<ValidationRule>) =>
    rule && onChange({ ...rule, ...patch });

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-600">Validasi respons</p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={rule?.kind ?? ""}
          onChange={(e) =>
            onChange(
              e.target.value
                ? defaultRule(e.target.value as ValidationRule["kind"])
                : null,
            )
          }
          aria-label="Jenis validasi"
          className={fieldClass}
        >
          <option value="">Tidak ada</option>
          {kinds.map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </select>

        {rule && (
          <select
            value={rule.op}
            onChange={(e) => {
              // ganti operator = bersihkan nilai lama supaya tidak nyangkut
              const keep = rule.message ? { message: rule.message } : {};
              const base: ValidationRule = {
                kind: rule.kind,
                op: e.target.value,
                ...keep,
              };
              if (rule.kind === "length" || rule.kind === "selectCount") {
                base.value = rule.value;
              }
              onChange(base);
            }}
            aria-label="Operator validasi"
            className={fieldClass}
          >
            {OPS[rule.kind].map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}

        {rule?.kind === "number" &&
          (rule.op === "between" || rule.op === "notBetween" ? (
            <>
              <NumInput
                value={rule.min}
                onChange={(v) => set({ min: v })}
                placeholder="Min"
                label="Nilai minimum"
              />
              <NumInput
                value={rule.max}
                onChange={(v) => set({ max: v })}
                placeholder="Maks"
                label="Nilai maksimum"
              />
            </>
          ) : rule.op !== "integer" ? (
            <NumInput
              value={typeof rule.value === "number" ? rule.value : undefined}
              onChange={(v) => set({ value: v })}
              placeholder="Nilai"
              label="Nilai"
            />
          ) : null)}

        {rule?.kind === "text" &&
          (rule.op === "contains" || rule.op === "notContains") && (
            <input
              type="text"
              value={typeof rule.value === "string" ? rule.value : ""}
              onChange={(e) => set({ value: e.target.value })}
              placeholder="Kata"
              aria-label="Kata"
              maxLength={200}
              className={`${fieldClass} w-48`}
            />
          )}

        {(rule?.kind === "length" || rule?.kind === "selectCount") && (
          <NumInput
            value={typeof rule.value === "number" ? rule.value : undefined}
            onChange={(v) => set({ value: v })}
            placeholder="Jumlah"
            label="Jumlah"
          />
        )}

        {rule?.kind === "regex" && (
          <input
            type="text"
            value={typeof rule.value === "string" ? rule.value : ""}
            onChange={(e) => set({ value: e.target.value })}
            placeholder="Contoh: ^[0-9]+$"
            aria-label="Pola regular expression"
            maxLength={200}
            className={`${fieldClass} w-56 font-mono`}
          />
        )}
      </div>

      {rule && (
        <input
          type="text"
          value={rule.message ?? ""}
          onChange={(e) => set({ message: e.target.value })}
          placeholder="Pesan error kustom (opsional)"
          aria-label="Pesan error kustom"
          maxLength={300}
          className={`${fieldClass} w-full`}
        />
      )}
    </div>
  );
}
