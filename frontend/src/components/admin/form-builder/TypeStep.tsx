"use client";

import { CalendarCheck, Check, FileText } from "lucide-react";
import { FormType } from "./shared";

interface Props {
  value: FormType;
  onChange: (v: FormType) => void;
}

const OPTIONS: {
  value: FormType;
  title: string;
  desc: string;
  features: string[];
  Icon: typeof FileText;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    value: "EVENT",
    title: "Form Event",
    desc: "Form untuk event non-kelas seperti hackathon, kompetisi, seminar, webinar, community event, dan recruitment event.",
    features: [
      "Dapat dikaitkan dengan event",
      "Dapat tampil pada halaman event",
      "Cocok untuk pendaftaran, submission, feedback event",
    ],
    Icon: CalendarCheck,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    value: "NON_EVENT",
    title: "Form Non-Event",
    desc: "Form yang tidak terkait dengan event. Digunakan untuk presensi, survei, feedback internal, pendataan, dan lainnya.",
    features: [
      "Tidak terkait dengan event",
      "Diakses melalui link mandiri",
      "Cocok untuk presensi, survei, pendataan, dll",
    ],
    Icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

export default function TypeStep({ value, onChange }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Tipe form"
      className="grid gap-4 md:grid-cols-2"
    >
      {OPTIONS.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative rounded-xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              active
                ? "border-emerald-500 bg-emerald-50/40"
                : "border-gray-200 bg-white hover:border-emerald-300"
            }`}
          >
            <span
              className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border ${
                active
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {active && <Check className="h-4 w-4" strokeWidth={3} />}
            </span>

            <span
              className={`flex h-14 w-14 items-center justify-center rounded-xl ${o.iconBg} ${o.iconColor}`}
            >
              <o.Icon className="h-7 w-7" />
            </span>

            <h2 className="mt-4 text-base font-bold text-gray-900">
              {o.title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              {o.desc}
            </p>

            <ul className="mt-4 space-y-2">
              {o.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-xs text-gray-600"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
