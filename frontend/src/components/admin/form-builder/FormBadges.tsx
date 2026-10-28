import { Clock } from "lucide-react";
import { FormStatus, FormType, STATUS_LABEL, TYPE_LABEL } from "./shared";

export function StatusBadge({ status }: { status: FormStatus }) {
  const style: Record<FormStatus, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-600",
    DRAFT: "bg-amber-50 text-amber-600",
    ARCHIVED: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${style[status]}`}
    >
      {status === "DRAFT" && <Clock className="h-3 w-3" />}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function TypeBadge({ type }: { type: FormType }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
      {TYPE_LABEL[type]}
    </span>
  );
}
