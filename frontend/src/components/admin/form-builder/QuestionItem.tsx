"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Settings2, Trash2 } from "lucide-react";
import ConfigEditor from "./ConfigEditor";
import FormToggle from "./FormToggle";
import MediaItemEditor from "./MediaItemEditor";
import OptionsEditor from "./OptionsEditor";
import ValidationEditor from "./ValidationEditor";
import {
  ALLOWED_VALIDATION_KINDS,
  ITEM_TYPE_LABEL,
  QUESTION_TYPES,
  hasShuffle,
  isChoice,
  isGrid,
  type EditorItem,
  type ItemType,
  type SectionTarget,
} from "./editorModel";

interface Props {
  formId: string;
  item: EditorItem;
  /** Nomor pertanyaan (kosong untuk elemen non-pertanyaan) */
  number?: number;
  index: number;
  total: number;
  sectionUid: string;
  targets: SectionTarget[];
  onChange: (patch: Partial<EditorItem>) => void;
  onChangeType: (type: ItemType) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

const iconBtn =
  "rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent";

function RowActions({
  index,
  total,
  onMove,
  onDuplicate,
  onDelete,
}: {
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        aria-label="Naikkan"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        className={iconBtn}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Turunkan"
        disabled={index === total - 1}
        onClick={() => onMove(1)}
        className={iconBtn}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Duplikat"
        onClick={onDuplicate}
        className={iconBtn}
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Hapus"
        onClick={onDelete}
        className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function QuestionItem({
  formId,
  item,
  number,
  index,
  total,
  sectionUid,
  targets,
  onChange,
  onChangeType,
  onDuplicate,
  onDelete,
  onMove,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const card = "rounded-xl border border-gray-200 bg-white p-4";
  const actions = (
    <RowActions
      index={index}
      total={total}
      onMove={onMove}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
    />
  );

  // ── Title & Description ────────────────────────────────────────────────────
  if (item.type === "TITLE_DESCRIPTION") {
    return (
      <div className={card}>
        <div className="space-y-2">
          <input
            type="text"
            value={item.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Judul"
            aria-label="Judul"
            maxLength={2000}
            className={`${inputClass} font-semibold`}
          />
          <textarea
            rows={2}
            value={item.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Deskripsi (opsional)"
            aria-label="Deskripsi"
            maxLength={2000}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">
            {ITEM_TYPE_LABEL.TITLE_DESCRIPTION}
          </span>
          {actions}
        </div>
      </div>
    );
  }

  // ── Gambar / Video ─────────────────────────────────────────────────────────
  if (item.type === "IMAGE" || item.type === "VIDEO") {
    return (
      <div className={card}>
        <MediaItemEditor
          formId={formId}
          item={item}
          onChange={(config) => onChange({ config })}
        />
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">
            {ITEM_TYPE_LABEL[item.type]}
          </span>
          {actions}
        </div>
      </div>
    );
  }

  // ── Pertanyaan ─────────────────────────────────────────────────────────────
  const hasValidation = !!ALLOWED_VALIDATION_KINDS[item.type];
  const customized =
    !!item.description.trim() || !!item.validation || item.shuffleOptions;

  return (
    <div className={card}>
      <div className="flex items-start gap-3">
        <span className="mt-2 w-6 shrink-0 text-sm font-semibold text-gray-500">
          {number}.
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={item.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Tulis pertanyaan"
              aria-label="Pertanyaan"
              maxLength={2000}
              className={`${inputClass} font-medium`}
            />
            <select
              value={item.type}
              onChange={(e) => onChangeType(e.target.value as ItemType)}
              aria-label="Tipe pertanyaan"
              className={`${inputClass} sm:w-52 sm:shrink-0`}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ITEM_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>

          {item.description.trim() && !panelOpen && (
            <p className="text-xs text-gray-500">{item.description}</p>
          )}

          {item.type === "SHORT_ANSWER" && (
            <input
              disabled
              placeholder="Jawaban singkat"
              className={`${inputClass} bg-gray-50`}
            />
          )}
          {item.type === "PARAGRAPH" && (
            <textarea
              disabled
              rows={2}
              placeholder="Jawaban panjang"
              className={`${inputClass} resize-none bg-gray-50`}
            />
          )}
          {(isChoice(item.type) || isGrid(item.type)) && (
            <OptionsEditor
              item={item}
              targets={targets}
              sectionUid={sectionUid}
              onChange={onChange}
            />
          )}
          {item.type === "FILE_UPLOAD" && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-xs text-gray-500">
              Responden mengunggah file di sini.
            </div>
          )}
          <ConfigEditor
            item={item}
            onChange={(config) => onChange({ config })}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <FormToggle
            checked={item.isRequired}
            onChange={(v) => onChange({ isRequired: v })}
            label="Wajib diisi"
          />
          <button
            type="button"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Pengaturan pertanyaan
            {customized && (
              <span
                aria-label="Ada pengaturan khusus"
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              />
            )}
          </button>
        </div>
        {actions}
      </div>

      {panelOpen && (
        <div className="mt-3 space-y-4 rounded-lg bg-gray-50 p-3">
          <div>
            <label
              htmlFor={`desc-${item.uid}`}
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Deskripsi pertanyaan
            </label>
            <input
              id={`desc-${item.uid}`}
              type="text"
              value={item.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Petunjuk singkat untuk responden (opsional)"
              maxLength={2000}
              className={inputClass}
            />
          </div>

          {hasValidation && (
            <ValidationEditor
              type={item.type}
              rule={item.validation}
              onChange={(validation) => onChange({ validation })}
            />
          )}

          {hasShuffle(item.type) && (
            <FormToggle
              checked={item.shuffleOptions}
              onChange={(v) => onChange({ shuffleOptions: v })}
              label={
                isGrid(item.type) ? "Acak urutan baris" : "Acak urutan pilihan"
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
