"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import QuestionItem from "./QuestionItem";
import type {
  EditorItem,
  EditorSection,
  ItemType,
  NavAction,
  SectionTarget,
} from "./editorModel";

interface Props {
  formId: string;
  section: EditorSection;
  index: number;
  totalSections: number;
  active: boolean;
  targets: SectionTarget[];
  /** uid item → nomor pertanyaan (hanya item yang punya jawaban) */
  numbering: Map<string, number>;
  onActivate: () => void;
  onChangeSection: (patch: Partial<EditorSection>) => void;
  onMoveSection: (dir: -1 | 1) => void;
  onDeleteSection: () => void;
  onChangeItem: (itemUid: string, patch: Partial<EditorItem>) => void;
  onChangeItemType: (itemUid: string, type: ItemType) => void;
  onDuplicateItem: (itemUid: string) => void;
  onDeleteItem: (itemUid: string) => void;
  onMoveItem: (itemUid: string, dir: -1 | 1) => void;
}

const selectClass =
  "rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const iconBtn =
  "rounded-md p-1.5 text-gray-500 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent";

export default function SectionCard({
  formId,
  section,
  index,
  totalSections,
  active,
  targets,
  numbering,
  onActivate,
  onChangeSection,
  onMoveSection,
  onDeleteSection,
  onChangeItem,
  onChangeItemType,
  onDuplicateItem,
  onDeleteItem,
  onMoveItem,
}: Props) {
  const navValue =
    section.nextAction === "GO_TO_SECTION"
      ? `GO:${section.nextSectionRef ?? ""}`
      : section.nextAction;
  const otherTargets = targets.filter((t) => t.uid !== section.uid);

  const setNav = (v: string) => {
    if (v.startsWith("GO:")) {
      onChangeSection({
        nextAction: "GO_TO_SECTION",
        nextSectionRef: v.slice(3) || null,
      });
    } else {
      onChangeSection({ nextAction: v as NavAction, nextSectionRef: null });
    }
  };

  return (
    <section
      onClickCapture={onActivate}
      onFocusCapture={onActivate}
      className={`rounded-xl border bg-white transition-colors ${
        active ? "border-emerald-300" : "border-gray-200"
      }`}
    >
      {/* Header section */}
      <div className="rounded-t-xl border-b border-emerald-100 bg-emerald-50/60 p-4">
        {totalSections > 1 && (
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-emerald-700">
              Section {index + 1} dari {totalSections}
            </span>
            <div className="flex flex-wrap items-center gap-1">
              <select
                aria-label="Setelah section ini"
                value={navValue}
                onChange={(e) => setNav(e.target.value)}
                className={selectClass}
              >
                <option value="NEXT">Lanjut ke section berikutnya</option>
                <option value="SUBMIT">Kirim form</option>
                {otherTargets.map((t) => (
                  <option key={t.uid} value={`GO:${t.uid}`}>
                    Lompat ke {t.label}
                  </option>
                ))}
                {navValue === "GO:" && (
                  <option value="GO:" disabled>
                    Pilih section tujuan…
                  </option>
                )}
              </select>
              <button
                type="button"
                aria-label="Naikkan section"
                disabled={index === 0}
                onClick={() => onMoveSection(-1)}
                className={iconBtn}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Turunkan section"
                disabled={index === totalSections - 1}
                onClick={() => onMoveSection(1)}
                className={iconBtn}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Hapus section"
                onClick={onDeleteSection}
                className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChangeSection({ title: e.target.value })}
          placeholder="Judul section"
          aria-label="Judul section"
          maxLength={300}
          className="w-full rounded-md bg-transparent px-1 text-base font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <input
          type="text"
          value={section.description}
          onChange={(e) => onChangeSection({ description: e.target.value })}
          placeholder="Deskripsi section (opsional)"
          aria-label="Deskripsi section"
          maxLength={2000}
          className="mt-1 w-full rounded-md bg-transparent px-1 text-sm text-gray-600 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Isi section */}
      <div className="space-y-3 p-4">
        {section.items.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
            Section ini masih kosong. Pilih elemen dari panel &quot;Tambah
            Elemen&quot;.
          </div>
        )}
        {section.items.map((it, i) => (
          <QuestionItem
            key={it.uid}
            formId={formId}
            item={it}
            number={numbering.get(it.uid)}
            index={i}
            total={section.items.length}
            sectionUid={section.uid}
            targets={targets}
            onChange={(patch) => onChangeItem(it.uid, patch)}
            onChangeType={(t) => onChangeItemType(it.uid, t)}
            onDuplicate={() => onDuplicateItem(it.uid)}
            onDelete={() => onDeleteItem(it.uid)}
            onMove={(dir) => onMoveItem(it.uid, dir)}
          />
        ))}
      </div>
    </section>
  );
}
