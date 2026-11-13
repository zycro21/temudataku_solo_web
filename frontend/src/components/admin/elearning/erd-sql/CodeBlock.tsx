"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CodeBlock({
  code,
  successMessage = "Query disalin",
}: {
  code: string;
  successMessage?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Gagal menyalin, salin manual dari kotak kode");
    }
  };

  return (
    <div className="relative rounded-lg bg-slate-900">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Salin kode"
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-slate-700/70 px-2 py-1 text-xs text-slate-100 hover:bg-emerald-600"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Tersalin" : "Salin"}
      </button>
      <pre className="overflow-x-auto p-3 pr-20 text-xs leading-relaxed text-emerald-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
