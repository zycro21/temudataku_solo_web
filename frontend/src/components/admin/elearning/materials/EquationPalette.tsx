"use client";

import { useState } from "react";
import {
  EXAMPLE_GROUPS,
  STRUCTURE_GROUPS,
  SYMBOL_GROUPS,
  type PaletteGroup,
} from "./equationData";
import { MathView } from "./MathView";

type PaletteTab = "symbols" | "structures" | "examples";

const TABS: { key: PaletteTab; label: string }[] = [
  { key: "symbols", label: "Symbols" },
  { key: "structures", label: "Structures" },
  { key: "examples", label: "Examples" },
];

// Cegah tombol mencuri fokus supaya posisi kursor / blok di editor tidak hilang
// sebelum onClick menyisipkan template.
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

function GroupChips({
  groups,
  activeId,
  onSelect,
}: {
  groups: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {groups.map((g) => (
        <button
          key={g.id}
          type="button"
          onMouseDown={keepFocus}
          onClick={() => onSelect(g.id)}
          aria-pressed={activeId === g.id}
          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
            activeId === g.id
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
          }`}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

function SymbolGrid({
  group,
  large,
  onInsert,
}: {
  group: PaletteGroup;
  large: boolean;
  onInsert: (latex: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {group.items.map((item) => (
        <button
          key={`${group.id}-${item.title}`}
          type="button"
          title={item.title}
          aria-label={item.title}
          onMouseDown={keepFocus}
          onClick={() => onInsert(item.insert)}
          className={`flex items-center justify-center rounded-md border border-gray-200 bg-white px-2 text-gray-800 transition-colors hover:border-emerald-400 hover:bg-emerald-50 ${
            large ? "min-h-12 min-w-14" : "h-9 min-w-9"
          }`}
        >
          <MathView latex={item.preview ?? item.insert} />
        </button>
      ))}
    </div>
  );
}

export default function EquationPalette({
  onInsert,
}: {
  onInsert: (latex: string) => void;
}) {
  const [tab, setTab] = useState<PaletteTab>("symbols");
  const [groupIds, setGroupIds] = useState<Record<PaletteTab, string>>({
    symbols: SYMBOL_GROUPS[0].id,
    structures: STRUCTURE_GROUPS[0].id,
    examples: EXAMPLE_GROUPS[0].id,
  });

  const groups =
    tab === "symbols"
      ? SYMBOL_GROUPS
      : tab === "structures"
        ? STRUCTURE_GROUPS
        : EXAMPLE_GROUPS;
  const activeId = groupIds[tab];

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50">
      <div role="tablist" className="flex border-b border-gray-200 px-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onMouseDown={keepFocus}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-emerald-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 p-3">
        <GroupChips
          groups={groups}
          activeId={activeId}
          onSelect={(id) => setGroupIds((prev) => ({ ...prev, [tab]: id }))}
        />

        <div className="max-h-56 overflow-y-auto pr-1">
          {tab === "examples" ? (
            <ul className="space-y-1.5">
              {(
                EXAMPLE_GROUPS.find((g) => g.id === activeId) ??
                EXAMPLE_GROUPS[0]
              ).items.map((item) => (
                <li key={item.title}>
                  <button
                    type="button"
                    onMouseDown={keepFocus}
                    onClick={() => onInsert(item.latex)}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    <span className="shrink-0 text-xs font-medium text-gray-500">
                      {item.title}
                    </span>
                    <span className="min-w-0 overflow-x-auto text-gray-800">
                      <MathView latex={item.latex} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <SymbolGrid
              group={
                (groups as PaletteGroup[]).find((g) => g.id === activeId) ??
                (groups as PaletteGroup[])[0]
              }
              large={tab === "structures"}
              onInsert={onInsert}
            />
          )}
        </div>
      </div>
    </div>
  );
}
