"use client";

import { ArrowRight, Link2 } from "lucide-react";
import { DATASET_TAG, RELATIONS, getTable } from "./erdSqlData";
import { GROUP_STYLES } from "./groupStyles";
import type { ColumnDef, ColumnStat, TableDef } from "./types";
import CodeBlock from "./CodeBlock";
import KeyBadge from "./KeyBadge";

interface TabProps {
  table: TableDef;
  onSelectTable: (name: string) => void;
}

const fmtValue = (v: string | number, type: string) => {
  if (typeof v === "number") {
    const n = v.toLocaleString("id-ID");
    return type.startsWith("DECIMAL") ? `Rp ${n}` : n;
  }
  return v;
};

function StatLine({ stat, type }: { stat: ColumnStat; type: string }) {
  return (
    <div className="mt-2 space-y-1.5">
      {stat.dist && (
        <div className="flex flex-wrap gap-1">
          {stat.dist.map(([v, n]) => (
            <span
              key={v}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {v}{" "}
              <span className="font-semibold text-emerald-700">
                {n.toLocaleString("id-ID")}
              </span>
            </span>
          ))}
        </div>
      )}
      {stat.range && (
        <p className="text-xs text-gray-500">
          Rentang:{" "}
          <span className="font-medium text-gray-700">
            {fmtValue(stat.range[0], type)} – {fmtValue(stat.range[1], type)}
          </span>
        </p>
      )}
      {typeof stat.nulls === "number" && (
        <p className="text-xs text-gray-500">
          NULL:{" "}
          <span className="font-medium text-gray-700">
            {stat.nulls.toLocaleString("id-ID")} baris
          </span>
        </p>
      )}
    </div>
  );
}

function ColumnItem({
  col,
  onSelectTable,
}: {
  col: ColumnDef;
  onSelectTable: (name: string) => void;
}) {
  return (
    <li className="rounded-lg border border-gray-200 p-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono text-sm font-semibold text-gray-800">
          {col.name}
        </span>
        {col.keys.map((k) => (
          <KeyBadge key={k} flag={k} />
        ))}
        {col.nullable && (
          <span className="rounded bg-gray-100 px-1 text-xs font-semibold leading-5 text-gray-600">
            NULL
          </span>
        )}
        <span className="ml-auto font-mono text-xs text-gray-400">
          {col.type}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-600">{col.desc}</p>
      {col.ref && (
        <button
          type="button"
          onClick={() => onSelectTable(col.ref![0])}
          className="mt-2 inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100"
        >
          <Link2 className="h-3 w-3" />
          References {col.ref[0]}.{col.ref[1]}
        </button>
      )}
      {col.stat && <StatLine stat={col.stat} type={col.type} />}
    </li>
  );
}

export function ColumnsTab({ table, onSelectTable }: TabProps) {
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {table.columns.map((c) => (
          <ColumnItem key={c.name} col={c} onSelectTable={onSelectTable} />
        ))}
      </ul>
      {table.notes.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-800">Catatan</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {table.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function RelationsTab({ table, onSelectTable }: TabProps) {
  const rels = RELATIONS.filter(
    (r) => r.parent === table.name || r.child === table.name,
  );

  return (
    <ul className="space-y-3">
      {rels.map((r) => {
        const isParent = r.parent === table.name;
        const other = isParent ? r.child : r.parent;
        const otherTable = getTable(other);
        const dot = otherTable
          ? GROUP_STYLES[otherTable.group].dot
          : "bg-gray-400";
        return (
          <li key={r.id} className="rounded-lg border border-gray-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-1.5 text-xs font-semibold leading-5 ${
                  isParent
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {isParent ? "Parent of" : "Child of"}
              </span>
              <button
                type="button"
                onClick={() => onSelectTable(other)}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-0.5 text-sm font-semibold text-gray-800 hover:border-emerald-400 hover:bg-emerald-50"
              >
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                {other}
              </button>
              <code className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                {r.parentLabel} → {r.childLabel}
              </code>
            </div>
            <p className="mt-2 text-sm text-gray-600">{r.desc}</p>
            <p className="mt-2 flex flex-wrap items-center gap-1 font-mono text-xs text-gray-700">
              <span>
                {r.parent}({r.parentCols.join(", ")})
              </span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <span>
                {r.child}({r.childCols.join(", ")})
              </span>
            </p>
            <div className="mt-2">
              <CodeBlock
                code={`${DATASET_TAG}\n${r.joinSql}`}
                successMessage="Contoh JOIN disalin"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function QueriesTab({ table }: { table: TableDef }) {
  const items = [
    { title: "Lihat isi tabel", sql: `SELECT * FROM ${table.name} LIMIT 5;` },
    ...table.queries,
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Salin ke fitur coding e-learning (bahasa SQL). Baris pertama menentukan
        dataset yang dipakai.
      </p>
      {items.map((q) => (
        <div key={q.title}>
          <p className="mb-1 text-sm font-semibold text-gray-800">{q.title}</p>
          <CodeBlock code={`${DATASET_TAG}\n${q.sql}`} />
        </div>
      ))}
    </div>
  );
}
