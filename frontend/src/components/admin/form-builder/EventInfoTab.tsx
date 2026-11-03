"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  newUid,
  type EventFaqItem,
  type EventTimelineItem,
  type FormSettings,
} from "./editorModel";

interface Props {
  settings: FormSettings;
  disabled: boolean;
  onChange: (patch: Partial<FormSettings>) => void;
}

const MAX_ROWS = 30; // sama dengan batas di backend

const fieldClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-50 sm:text-sm";

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-gray-500">{desc}</p>}
      </div>
      <div className="space-y-4 p-3 sm:p-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1 text-xs font-medium text-gray-600">
      {label}
      {children}
    </label>
  );
}

function RowTools({
  index,
  total,
  disabled,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  disabled: boolean;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const btn =
    "rounded-md p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:p-1.5";
  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={disabled || index === 0}
        aria-label="Naikkan"
        className={btn}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={disabled || index === total - 1}
        aria-label="Turunkan"
        className={btn}
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Hapus"
        className={`${btn} hover:text-red-600`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function moveIn<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const copy = [...list];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

export default function EventInfoTab({
  settings: s,
  disabled,
  onChange,
}: Props) {
  const setTimeline = (next: EventTimelineItem[]) =>
    onChange({ eventTimeline: next });
  const setFaqs = (next: EventFaqItem[]) => onChange({ eventFaqs: next });

  const patchTimeline = (uid: string, patch: Partial<EventTimelineItem>) =>
    setTimeline(
      s.eventTimeline.map((t) => (t.uid === uid ? { ...t, ...patch } : t)),
    );
  const patchFaq = (uid: string, patch: Partial<EventFaqItem>) =>
    setFaqs(s.eventFaqs.map((f) => (f.uid === uid ? { ...f, ...patch } : f)));

  return (
    <div className="max-w-3xl space-y-4">
      <Card
        title="Tentang Event"
        desc="Judul besar di bagian atas halaman dan isi tab Deskripsi. Judul kosong = memakai judul form."
      >
        <Field label="Judul event">
          <input
            type="text"
            value={s.eventTitle}
            maxLength={200}
            disabled={disabled}
            onChange={(e) => onChange({ eventTitle: e.target.value })}
            placeholder="Contoh: TemuDataku AI Hackathon 2027"
            className={`${fieldClass} block w-full font-normal`}
          />
        </Field>
        <Field label="Deskripsi event">
          <textarea
            value={s.eventDescription}
            maxLength={5000}
            rows={5}
            disabled={disabled}
            onChange={(e) => onChange({ eventDescription: e.target.value })}
            placeholder="Kosongkan agar tab Deskripsi disembunyikan"
            className={`${fieldClass} block w-full resize-y font-normal`}
          />
        </Field>
      </Card>

      <Card
        title="Informasi Event"
        desc="Tampil di panel “Informasi Event” dan di bawah judul pada halaman form."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tanggal mulai">
            <input
              type="datetime-local"
              value={s.eventStartAt}
              disabled={disabled}
              onChange={(e) => onChange({ eventStartAt: e.target.value })}
              className={`${fieldClass} block w-full font-normal`}
            />
          </Field>
          <Field label="Tanggal selesai">
            <input
              type="datetime-local"
              value={s.eventEndAt}
              min={s.eventStartAt || undefined}
              disabled={disabled}
              onChange={(e) => onChange({ eventEndAt: e.target.value })}
              className={`${fieldClass} block w-full font-normal`}
            />
          </Field>
          <Field label="Format pelaksanaan">
            <select
              value={s.eventMode}
              disabled={disabled}
              onChange={(e) =>
                onChange({
                  eventMode: e.target.value as FormSettings["eventMode"],
                })
              }
              className={`${fieldClass} block w-full font-normal`}
            >
              <option value="">Belum dipilih</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </Field>
          <Field label="Lokasi">
            <input
              type="text"
              value={s.eventLocation}
              maxLength={255}
              disabled={disabled}
              onChange={(e) => onChange({ eventLocation: e.target.value })}
              placeholder="Nama tempat, kota, atau platform"
              className={`${fieldClass} block w-full font-normal`}
            />
          </Field>
          <Field label="Penyelenggara">
            <input
              type="text"
              value={s.eventOrganizer}
              maxLength={150}
              disabled={disabled}
              onChange={(e) => onChange({ eventOrganizer: e.target.value })}
              placeholder="Contoh: TemuDataku"
              className={`${fieldClass} block w-full font-normal`}
            />
          </Field>
          <Field label="Kategori event">
            <input
              type="text"
              value={s.eventCategoryLabel}
              maxLength={80}
              disabled={disabled}
              onChange={(e) => onChange({ eventCategoryLabel: e.target.value })}
              placeholder="Contoh: Hackathon"
              className={`${fieldClass} block w-full font-normal`}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Timeline"
        desc="Rangkaian tahapan atau jadwal acara, tampil di tab Timeline. Kosongkan semua agar tab disembunyikan."
      >
        {s.eventTimeline.length === 0 && (
          <p className="text-xs text-gray-500">Belum ada timeline.</p>
        )}
        {s.eventTimeline.map((t, i) => (
          <div
            key={t.uid}
            className="space-y-3 rounded-lg border border-gray-200 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-500">
                Tahap {i + 1}
              </span>
              <RowTools
                index={i}
                total={s.eventTimeline.length}
                disabled={disabled}
                onMove={(dir) => setTimeline(moveIn(s.eventTimeline, i, dir))}
                onRemove={() =>
                  setTimeline(s.eventTimeline.filter((x) => x.uid !== t.uid))
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tanggal">
                <input
                  type="date"
                  value={t.date}
                  disabled={disabled}
                  onChange={(e) =>
                    patchTimeline(t.uid, { date: e.target.value })
                  }
                  className={`${fieldClass} block w-full font-normal`}
                />
              </Field>
              <Field label="Waktu (opsional)">
                <input
                  type="text"
                  value={t.time}
                  maxLength={40}
                  disabled={disabled}
                  onChange={(e) =>
                    patchTimeline(t.uid, { time: e.target.value })
                  }
                  placeholder="09.00 - 12.00 WIB"
                  className={`${fieldClass} block w-full font-normal`}
                />
              </Field>
            </div>
            <Field label="Judul tahap">
              <input
                type="text"
                value={t.title}
                maxLength={150}
                disabled={disabled}
                onChange={(e) =>
                  patchTimeline(t.uid, { title: e.target.value })
                }
                placeholder="Contoh: Pendaftaran dibuka"
                className={`${fieldClass} block w-full font-normal`}
              />
            </Field>
            <Field label="Keterangan (opsional)">
              <textarea
                value={t.description}
                maxLength={1000}
                rows={2}
                disabled={disabled}
                onChange={(e) =>
                  patchTimeline(t.uid, { description: e.target.value })
                }
                className={`${fieldClass} block w-full resize-y font-normal`}
              />
            </Field>
          </div>
        ))}
        <button
          type="button"
          disabled={disabled || s.eventTimeline.length >= MAX_ROWS}
          onClick={() =>
            setTimeline([
              ...s.eventTimeline,
              { uid: newUid(), date: "", time: "", title: "", description: "" },
            ])
          }
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Tambah tahap
        </button>
      </Card>

      <Card
        title="FAQ"
        desc="Pertanyaan yang sering diajukan, tampil di tab FAQ. Kosongkan semua agar tab disembunyikan."
      >
        {s.eventFaqs.length === 0 && (
          <p className="text-xs text-gray-500">Belum ada FAQ.</p>
        )}
        {s.eventFaqs.map((f, i) => (
          <div
            key={f.uid}
            className="space-y-3 rounded-lg border border-gray-200 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-500">
                FAQ {i + 1}
              </span>
              <RowTools
                index={i}
                total={s.eventFaqs.length}
                disabled={disabled}
                onMove={(dir) => setFaqs(moveIn(s.eventFaqs, i, dir))}
                onRemove={() =>
                  setFaqs(s.eventFaqs.filter((x) => x.uid !== f.uid))
                }
              />
            </div>
            <Field label="Pertanyaan">
              <input
                type="text"
                value={f.question}
                maxLength={300}
                disabled={disabled}
                onChange={(e) => patchFaq(f.uid, { question: e.target.value })}
                className={`${fieldClass} block w-full font-normal`}
              />
            </Field>
            <Field label="Jawaban">
              <textarea
                value={f.answer}
                maxLength={3000}
                rows={3}
                disabled={disabled}
                onChange={(e) => patchFaq(f.uid, { answer: e.target.value })}
                className={`${fieldClass} block w-full resize-y font-normal`}
              />
            </Field>
          </div>
        ))}
        <button
          type="button"
          disabled={disabled || s.eventFaqs.length >= MAX_ROWS}
          onClick={() =>
            setFaqs([
              ...s.eventFaqs,
              { uid: newUid(), question: "", answer: "" },
            ])
          }
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Tambah FAQ
        </button>
      </Card>
    </div>
  );
}
