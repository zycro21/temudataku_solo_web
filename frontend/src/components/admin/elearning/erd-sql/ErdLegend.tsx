import { GROUPS } from "./erdSqlData";
import { GROUP_STYLES } from "./groupStyles";
import KeyBadge from "./KeyBadge";

export default function ErdLegend() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
      <span className="flex items-center gap-1">
        <KeyBadge flag="PK" /> Primary key
      </span>
      <span className="flex items-center gap-1">
        <KeyBadge flag="FK" /> Foreign key
      </span>
      <span className="flex items-center gap-1">
        <KeyBadge flag="UQ" /> Unique
      </span>
      <span>
        <code className="rounded bg-white px-1">1</code> exactly one ·{" "}
        <code className="rounded bg-white px-1">0..1</code> zero or one ·{" "}
        <code className="rounded bg-white px-1">0..N</code> zero or many ·{" "}
        <code className="rounded bg-white px-1">1..N</code> one or many
      </span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {GROUPS.map((g) => (
          <span key={g.key} className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${GROUP_STYLES[g.key].dot}`} />
            {g.label}
          </span>
        ))}
      </span>
    </div>
  );
}