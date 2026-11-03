"use client";

import type { ReactNode } from "react";
import FormLinkCard from "./FormLinkCard";
import FormToggle from "./FormToggle";
import type { FormSettings } from "./editorModel";
import type { FormStatus, FormType } from "./shared";

interface Props {
  formId: string;
  status: FormStatus;
  /** Dipanggil setelah link form tersimpan */
  onLinkSaved: () => void;
  type: FormType;
  /** Form sudah dikaitkan ke sebuah Event (pengaitan Event opsional) */
  hasEvent: boolean;
  settings: FormSettings;
  disabled: boolean;
  onChange: (patch: Partial<FormSettings>) => void;
}

const fieldClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-50";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
        {title}
      </h2>
      <div className="divide-y divide-gray-100">{children}</div>
    </section>
  );
}

function Row({
  title,
  desc,
  control,
  children,
}: {
  title: string;
  desc?: string;
  control: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-3 px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800">{title}</p>
          {desc && <p className="mt-0.5 text-xs text-gray-500">{desc}</p>}
        </div>
        <div className="shrink-0">{control}</div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsTab({
  formId,
  status,
  onLinkSaved,
  type,
  hasEvent,
  settings: s,
  disabled,
  onChange,
}: Props) {
  const toggle = (key: keyof FormSettings, label: string) => (
    <FormToggle
      checked={s[key] as boolean}
      onChange={(v) => onChange({ [key]: v } as Partial<FormSettings>)}
      label={label}
      disabled={disabled}
    />
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-4">
        <Card title="Penerimaan Respons">
          <Row
            title="Menerima respons"
            desc="Saklar manual. Berbeda dari status Publish: form bisa Published tetapi sedang tidak menerima respons."
            control={toggle(
              "acceptingResponses",
              s.acceptingResponses ? "Aktif" : "Nonaktif",
            )}
          />
          <Row
            title="Batas jumlah responden"
            desc="Form menutup otomatis saat jumlah respons mencapai batas."
            control={toggle(
              "responseLimitEnabled",
              s.responseLimitEnabled ? "Aktif" : "Nonaktif",
            )}
          >
            {s.responseLimitEnabled && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Maksimum
                <input
                  type="number"
                  min={1}
                  max={1000000}
                  value={s.responseLimit ?? ""}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({
                      responseLimit:
                        e.target.value === ""
                          ? null
                          : Math.round(Number(e.target.value)),
                    })
                  }
                  className={`${fieldClass} w-32`}
                />
                responden
              </label>
            )}
          </Row>
          <Row
            title="Periode Penerimaan Respons"
            desc="Respons hanya diterima di antara tanggal mulai dan selesai."
            control={toggle(
              "periodEnabled",
              s.periodEnabled ? "Aktif" : "Nonaktif",
            )}
          >
            {s.periodEnabled && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-gray-600">
                  Mulai
                  <input
                    type="datetime-local"
                    value={s.openAt}
                    disabled={disabled}
                    onChange={(e) => onChange({ openAt: e.target.value })}
                    className={`${fieldClass} block w-full font-normal`}
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-gray-600">
                  Selesai
                  <input
                    type="datetime-local"
                    value={s.closeAt}
                    min={s.openAt || undefined}
                    disabled={disabled}
                    onChange={(e) => onChange({ closeAt: e.target.value })}
                    className={`${fieldClass} block w-full font-normal`}
                  />
                </label>
              </div>
            )}
          </Row>
          {type === "EVENT" && hasEvent && (
            <Row
              title="Tampilkan form di halaman Event"
              desc="Berlaku setelah form dipublish. Terpisah dari status Publish dan penerimaan respons."
              control={toggle(
                "showOnEventPage",
                s.showOnEventPage ? "Aktif" : "Nonaktif",
              )}
            />
          )}
          <div className="space-y-2 px-4 py-3">
            <label
              htmlFor="closed-message"
              className="block text-sm font-medium text-gray-800"
            >
              Pesan saat form ditutup
            </label>
            <textarea
              id="closed-message"
              rows={2}
              value={s.closedMessage}
              disabled={disabled}
              maxLength={2000}
              onChange={(e) => onChange({ closedMessage: e.target.value })}
              placeholder="Contoh: Pendaftaran sudah ditutup. Terima kasih atas minat Anda."
              className={`${fieldClass} w-full resize-none`}
            />
          </div>
        </Card>

        <Card title="Responder">
          <Row
            title="Akses responder"
            desc="Pilih apakah responder wajib login atau cukup memiliki link."
            control={
              <select
                value={s.responderAccess}
                disabled={disabled}
                onChange={(e) =>
                  onChange({
                    responderAccess: e.target
                      .value as FormSettings["responderAccess"],
                  })
                }
                aria-label="Akses responder"
                className={fieldClass}
              >
                <option value="ANYONE_WITH_LINK">Siapa saja dengan link</option>
                <option value="LOGIN_REQUIRED">Wajib login akun</option>
              </select>
            }
          />
          <Row
            title="Kumpulkan alamat email"
            control={toggle(
              "collectEmail",
              s.collectEmail ? "Aktif" : "Nonaktif",
            )}
          />
          <Row
            title="Batasi satu respons per akun"
            desc="Berlaku untuk responder yang login."
            control={toggle(
              "limitOneResponsePerAccount",
              s.limitOneResponsePerAccount ? "Aktif" : "Nonaktif",
            )}
          />
          <Row
            title="Izinkan edit respons setelah submit"
            control={toggle(
              "allowEditResponse",
              s.allowEditResponse ? "Aktif" : "Nonaktif",
            )}
          />
          <Row
            title="Kirim tanda terima respons"
            desc="Dikirim ke email responder, jadi pastikan email responder tersedia (login atau kumpulkan email)."
            control={toggle(
              "sendResponseReceipt",
              s.sendResponseReceipt ? "Aktif" : "Nonaktif",
            )}
          />
          <Row
            title="Autosave draft responder"
            desc="Jawaban yang belum dikirim tersimpan otomatis. Butuh responder yang login."
            control={toggle(
              "allowResponderDraft",
              s.allowResponderDraft ? "Aktif" : "Nonaktif",
            )}
          />
          <Row
            title="Acak urutan pertanyaan"
            control={toggle(
              "shuffleQuestionOrder",
              s.shuffleQuestionOrder ? "Aktif" : "Nonaktif",
            )}
          />
        </Card>

        <Card title="Notifikasi & Konfirmasi">
          <Row
            title="Notifikasi email untuk respons baru"
            control={toggle(
              "notifyOnNewResponse",
              s.notifyOnNewResponse ? "Aktif" : "Nonaktif",
            )}
          />
          <div className="space-y-2 px-4 py-3">
            <label
              htmlFor="confirmation-message"
              className="block text-sm font-medium text-gray-800"
            >
              Pesan konfirmasi setelah submit
            </label>
            <textarea
              id="confirmation-message"
              rows={3}
              value={s.confirmationMessage}
              disabled={disabled}
              maxLength={2000}
              onChange={(e) =>
                onChange({ confirmationMessage: e.target.value })
              }
              placeholder="Contoh: Terima kasih, pendaftaran Anda sudah kami terima."
              className={`${fieldClass} w-full resize-none`}
            />
          </div>
        </Card>
      </div>

      <FormLinkCard
        formId={formId}
        status={status}
        disabled={disabled}
        onSaved={onLinkSaved}
      />
    </div>
  );
}
