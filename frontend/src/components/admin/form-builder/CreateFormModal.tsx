"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FORM_API, FormType, getApiErrorMessage } from "./shared";

interface EligibleEvent {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tipe yang terpilih saat modal dibuka (mengikuti tab aktif). */
  defaultType: FormType;
  onCreated: () => void;
}

const TYPE_OPTIONS: { value: FormType; label: string; desc: string }[] = [
  {
    value: "EVENT",
    label: "Form Event",
    desc: "Terhubung ke satu Event non-kelas dan bisa tampil di halaman Event.",
  },
  {
    value: "NON_EVENT",
    label: "Form Non-Event",
    desc: "Tidak terkait Event, dibagikan lewat link langsung.",
  },
];

export default function CreateFormModal({
  open,
  onOpenChange,
  defaultType,
  onCreated,
}: Props) {
  const [type, setType] = useState<FormType>(defaultType);
  const [title, setTitle] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState<EligibleEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset isian setiap modal dibuka
  useEffect(() => {
    if (!open) return;
    setType(defaultType);
    setTitle("");
    setEventId("");
  }, [open, defaultType]);

  // Daftar Event eligible, hanya dimuat untuk Form Event
  useEffect(() => {
    if (!open || type !== "EVENT") return;
    const controller = new AbortController();
    setEventsLoading(true);
    setEventsError(null);
    axios
      .get(`${FORM_API}/events/eligible`, {
        params: { limit: 50 },
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setEvents(data?.items ?? []);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setEvents([]);
        setEventsError(getApiErrorMessage(err, "Gagal memuat daftar Event"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setEventsLoading(false);
      });
    return () => controller.abort();
  }, [open, type]);

  const canSubmit =
    !submitting && (type === "NON_EVENT" || (!!eventId && !eventsError));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const toastId = toast.loading("Membuat form...");
    try {
      await axios.post(
        `${FORM_API}/forms`,
        {
          type,
          ...(title.trim() && { title: title.trim() }),
          ...(type === "EVENT" && { eventId }),
        },
        { withCredentials: true },
      );
      toast.success("Form berhasil dibuat", { id: toastId });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal membuat form"), {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex items-start justify-between">
          <DialogTitle>Buat Form Baru</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-600">
              Tipe form
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {TYPE_OPTIONS.map((o) => {
                const active = o.value === type;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setType(o.value)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <span
                      className={`block text-sm font-semibold ${
                        active ? "text-emerald-700" : "text-gray-800"
                      }`}
                    >
                      {o.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {o.desc}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              Tipe tidak bisa diubah setelah form dibuat.
            </p>
          </div>

          {type === "EVENT" && (
            <div>
              <label
                htmlFor="form-event"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Event terkait
              </label>
              {eventsError ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {eventsError}
                </p>
              ) : (
                <select
                  id="form-event"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  disabled={eventsLoading}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-50"
                >
                  <option value="">
                    {eventsLoading ? "Memuat Event..." : "Pilih Event"}
                  </option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="form-title"
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Judul form <span className="text-gray-400">(opsional)</span>
            </label>
            <input
              id="form-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Form Pendaftaran Hackathon"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {submitting ? "Membuat..." : "Buat Form"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
