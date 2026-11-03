"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  HelpCircle,
  ListChecks,
  Loader2,
  Palette,
  Save,
  Send,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppearanceTab from "./AppearanceTab";
import ElementPalette from "./ElementPalette";
import EventInfoTab from "./EventInfoTab";
import { StatusBadge } from "./FormBadges";
import FormBreadcrumb from "./FormBreadcrumb";
import FormPreview from "./FormPreview";
import ImportQuestionsModal from "./ImportQuestionsModal";
import SectionCard from "./SectionCard";
import SettingsTab from "./SettingsTab";
import ShareLinkPanel from "./ShareLinkPanel";
import {
  changeItemType,
  cloneItem,
  defaultSettings,
  findLoop,
  isAnswerable,
  newItem,
  newSection,
  sectionTargets,
  settingsPayload,
  toEditorSections,
  toPayload,
  toSettings,
  validateLocal,
  validateSettings,
  type EditorItem,
  type EditorSection,
  type FormDetail,
  type FormSettings,
  type ItemType,
} from "./editorModel";
import {
  FORM_API,
  formListHref,
  formResponsesHref,
  getApiErrorMessage,
  type FormStatus,
  type FormType,
} from "./shared";

type Tab = "questions" | "event" | "appearance" | "settings";

const TABS: { key: Tab; label: string; Icon: LucideIcon }[] = [
  { key: "questions", label: "Pertanyaan", Icon: HelpCircle },
  { key: "event", label: "Info Event", Icon: CalendarDays }, // hanya Form Event
  { key: "appearance", label: "Tampilan", Icon: Palette },
  { key: "settings", label: "Pengaturan", Icon: Settings },
];

interface Meta {
  type: FormType;
  status: FormStatus;
  eventName: string | null;
}

export default function FormEditor() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const formId = String(params?.id ?? "");
  const isNew = searchParams.get("new") === "1";

  const [meta, setMeta] = useState<Meta | null>(null);
  const [settings, setSettings] = useState<FormSettings>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState("");
  const [sections, setSections] = useState<EditorSection[]>([]);
  const [activeUid, setActiveUid] = useState("");
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<Tab>("questions");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busyStatus, setBusyStatus] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  // Naik setiap link form berubah, supaya panel Bagikan Link memuat ulang
  const [linkVersion, setLinkVersion] = useState(0);

  const apply = useCallback((d: FormDetail) => {
    const s = toSettings(d);
    setMeta({
      type: d.type,
      status: d.status,
      eventName: d.eventNameSnapshot,
    });
    setSettings(s);
    setSavedSettings(JSON.stringify(settingsPayload(s, d.type)));
    const next = toEditorSections(d);
    setSections(next);
    setActiveUid((prev) =>
      next.some((x) => x.uid === prev) ? prev : next[0].uid,
    );
    setDirty(false);
  }, []);

  // Muat detail form + seluruh struktur
  useEffect(() => {
    if (!formId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(`${FORM_API}/forms/${formId}`, {
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => apply(res.data?.data ?? res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(getApiErrorMessage(err, "Gagal memuat form"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [formId, apply, reloadTick]);

  // Peringatan kalau menutup tab saat masih ada perubahan yang belum disimpan
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // ── Edit pengaturan / tema ─────────────────────────────────────────────────
  const patchSettings = (patch: Partial<FormSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
    setDirty(true);
  };
  // Header image langsung tersimpan di server, tidak membuat form "kotor"
  const setHeaderImage = (path: string | null) =>
    setSettings((s) => ({ ...s, headerImage: path }));

  // ── Edit struktur (semua lewat edit() supaya dirty ikut menyala) ───────────
  const edit = (fn: (s: EditorSection[]) => EditorSection[]) => {
    setSections(fn);
    setDirty(true);
  };

  const patchSection = (sUid: string, patch: Partial<EditorSection>) =>
    edit((ss) => ss.map((s) => (s.uid === sUid ? { ...s, ...patch } : s)));

  const mapItems = (sUid: string, fn: (items: EditorItem[]) => EditorItem[]) =>
    edit((ss) =>
      ss.map((s) => (s.uid === sUid ? { ...s, items: fn(s.items) } : s)),
    );

  const patchItem = (sUid: string, iUid: string, patch: Partial<EditorItem>) =>
    mapItems(sUid, (items) =>
      items.map((it) => (it.uid === iUid ? { ...it, ...patch } : it)),
    );

  const changeType = (sUid: string, iUid: string, type: ItemType) =>
    mapItems(sUid, (items) =>
      items.map((it) => (it.uid === iUid ? changeItemType(it, type) : it)),
    );

  const duplicateItem = (sUid: string, iUid: string) =>
    mapItems(sUid, (items) => {
      const i = items.findIndex((it) => it.uid === iUid);
      if (i < 0) return items;
      const copy = [...items];
      copy.splice(i + 1, 0, cloneItem(items[i]));
      return copy;
    });

  const deleteItem = (sUid: string, iUid: string) =>
    mapItems(sUid, (items) => items.filter((it) => it.uid !== iUid));

  const moveItem = (sUid: string, iUid: string, dir: -1 | 1) =>
    mapItems(sUid, (items) => {
      const i = items.findIndex((it) => it.uid === iUid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= items.length) return items;
      const copy = [...items];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  // Elemen baru masuk ke section yang sedang aktif (terakhir diklik/difokus)
  const addItems = (items: EditorItem[]) => {
    const target = sections.find((s) => s.uid === activeUid) ?? sections[0];
    if (!target) return;
    mapItems(target.uid, (cur) => [...cur, ...items]);
  };

  const addSection = () => {
    const s = newSection();
    edit((ss) => [...ss, s]);
    setActiveUid(s.uid);
  };

  const moveSection = (sUid: string, dir: -1 | 1) =>
    edit((ss) => {
      const i = ss.findIndex((s) => s.uid === sUid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= ss.length) return ss;
      const copy = [...ss];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const deleteSection = (sUid: string) => {
    const target = sections.find((s) => s.uid === sUid);
    if (!target || sections.length <= 1) return;
    if (
      target.items.length > 0 &&
      !window.confirm(
        `Section ini berisi ${target.items.length} elemen. Hapus section beserta isinya?`,
      )
    ) {
      return;
    }
    edit((ss) =>
      ss
        .filter((s) => s.uid !== sUid)
        // Rujukan "lompat ke section" yang menuju section ini dikembalikan ke NEXT
        .map((s) => ({
          ...s,
          ...(s.nextSectionRef === sUid
            ? { nextAction: "NEXT" as const, nextSectionRef: null }
            : {}),
          items: s.items.map((it) => ({
            ...it,
            options: it.options.map((o) =>
              o.branchSectionRef === sUid
                ? {
                    ...o,
                    branchAction: "NEXT" as const,
                    branchSectionRef: null,
                  }
                : o,
            ),
          })),
        })),
    );
    if (activeUid === sUid) {
      setActiveUid(sections.find((s) => s.uid !== sUid)?.uid ?? "");
    }
  };

  const numbering = useMemo(() => {
    const m = new Map<string, number>();
    let n = 0;
    sections.forEach((s) =>
      s.items.forEach((it) => {
        if (isAnswerable(it.type)) m.set(it.uid, ++n);
      }),
    );
    return m;
  }, [sections]);

  const targets = useMemo(() => sectionTargets(sections), [sections]);
  const loop = useMemo(() => findLoop(sections), [sections]);

  // ── Simpan / Publish / Unpublish ───────────────────────────────────────────
  const save = async (): Promise<boolean> => {
    if (!meta) return false;
    const problem = validateSettings(settings) ?? validateLocal(sections);
    if (problem) {
      toast.error(problem);
      return false;
    }

    setSaving(true);
    const toastId = toast.loading("Menyimpan...");
    try {
      const payload = settingsPayload(settings, meta.type);
      if (JSON.stringify(payload) !== savedSettings) {
        await axios.patch(`${FORM_API}/forms/${formId}`, payload, {
          withCredentials: true,
        });
      }
      const res = await axios.put(
        `${FORM_API}/forms/${formId}/structure`,
        toPayload(sections),
        { withCredentials: true },
      );
      apply(res.data?.data ?? res.data);
      toast.success(
        meta.status === "PUBLISHED" ? "Perubahan tersimpan" : "Draft tersimpan",
        { id: toastId },
      );
      return true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal menyimpan form"), {
        id: toastId,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (action: "publish" | "unpublish") => {
    if (action === "publish" && !(await save())) return;
    if (
      action === "unpublish" &&
      !window.confirm(
        "Batalkan publikasi? Link form tidak bisa diakses responder, tetapi konfigurasi dan response tetap aman.",
      )
    ) {
      return;
    }
    setBusyStatus(true);
    const toastId = toast.loading(
      action === "publish"
        ? "Mempublikasikan form..."
        : "Membatalkan publikasi...",
    );
    try {
      const res = await axios.post(
        `${FORM_API}/forms/${formId}/${action}`,
        {},
        { withCredentials: true },
      );
      const d = res.data?.data ?? res.data;
      setMeta((m) => (m ? { ...m, status: d.status } : m));
      toast.success(
        action === "publish"
          ? "Form berhasil dipublikasikan"
          : "Publikasi dibatalkan, form kembali ke Draft",
        { id: toastId },
      );
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          action === "publish"
            ? "Gagal mempublikasikan form"
            : "Gagal membatalkan publikasi",
        ),
        { id: toastId },
      );
    } finally {
      setBusyStatus(false);
    }
  };

  const handleBack = () => {
    if (dirty && !window.confirm("Perubahan belum disimpan. Tetap keluar?")) {
      return;
    }
    router.push(formListHref);
  };

  // ── Tampilan ────────────────────────────────────────────────────────────────
  const crumbs = isNew
    ? ["Buat Form", "Pilih Jenis", "Detail Form", "Susun Form"]
    : ["Edit Form"];

  if (loading) {
    return (
      <div className="space-y-5">
        <FormBreadcrumb crumbs={crumbs} />
        <div className="h-24 animate-pulse rounded-xl border border-gray-100 bg-gray-50" />
        <div className="h-64 animate-pulse rounded-xl border border-gray-100 bg-gray-50" />
      </div>
    );
  }

  if (error || !meta) {
    return (
      <div className="space-y-5">
        <FormBreadcrumb crumbs={crumbs} />
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center">
          <p className="text-sm text-red-600">
            {error ?? "Form tidak ditemukan"}
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.push(formListHref)}>
              Kembali
            </Button>
            <button
              type="button"
              onClick={() => setReloadTick((n) => n + 1)}
              className="rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
            >
              Coba lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const locked = meta.status === "ARCHIVED";
  const published = meta.status === "PUBLISHED";
  const busy = saving || busyStatus;

  return (
    <div className="space-y-5">
      <FormBreadcrumb crumbs={crumbs} />

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Navigasi lokal */}
        <nav
          role="tablist"
          aria-label="Bagian editor"
          className="flex shrink-0 gap-1 overflow-x-auto lg:w-44 lg:flex-col lg:overflow-visible"
        >
          {TABS.filter((t) => t.key !== "event" || meta.type === "EVENT").map(
            ({ key, label, Icon }) => {
              const activeTab = tab === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={activeTab}
                  onClick={() => setTab(key)}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeTab
                      ? "bg-emerald-100 font-semibold text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            },
          )}
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          {/* Header builder */}
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1 xl:min-w-[18rem]">
              <input
                type="text"
                value={settings.title}
                onChange={(e) => patchSettings({ title: e.target.value })}
                disabled={locked}
                maxLength={200}
                placeholder="Judul form"
                aria-label="Judul form"
                className="block w-full min-w-0 truncate rounded-md bg-transparent px-1 text-lg font-bold sm:text-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 px-1">
                <StatusBadge status={meta.status} />
                <p className="min-w-0 text-xs text-gray-500">
                  {meta.type === "EVENT"
                    ? `Form Event${meta.eventName ? ` · ${meta.eventName}` : ""}`
                    : "Form Non-Event"}
                  {dirty && " · ada perubahan yang belum disimpan"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 max-sm:[&>*]:flex-1 xl:max-w-[60%] xl:justify-end">
              <Button variant="outline" onClick={handleBack} disabled={busy}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Kembali
              </Button>
              <Button
                variant="outline"
                onClick={() => setTab("appearance")}
                className="gap-1"
              >
                <Palette className="h-4 w-4" />
                Tema
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreviewOpen(true)}
                className="gap-1"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>

              {published && (
                <Link
                  href={formResponsesHref(formId)}
                  className="inline-flex h-9 items-center gap-1 rounded-md border bg-white px-4 text-sm font-medium text-gray-900 shadow-xs hover:bg-gray-50"
                >
                  <ListChecks className="h-4 w-4" />
                  Responses
                </Link>
              )}

              {!locked && (
                <Button
                  variant="outline"
                  onClick={save}
                  disabled={busy}
                  className="gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {published ? "Simpan Perubahan" : "Simpan Draft"}
                </Button>
              )}

              {!locked &&
                (published ? (
                  <Button
                    onClick={() => changeStatus("unpublish")}
                    disabled={busy}
                    variant="outline"
                    className="gap-1 border-amber-400 text-amber-700 hover:bg-amber-50"
                  >
                    {busyStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    onClick={() => changeStatus("publish")}
                    disabled={busy}
                    className="gap-1 bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    {busyStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Publish
                  </Button>
                ))}
            </div>
          </div>

          {locked && (
            <p className="rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600">
              Form ini sudah diarsipkan dan tidak bisa diubah.
            </p>
          )}

          {/* Di tab Pengaturan, link + QR sudah ada di kartu "Bagikan Link Form" */}
          {published && tab !== "settings" && (
            <ShareLinkPanel formId={formId} refreshKey={linkVersion} />
          )}

          {loop && (
            <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {loop}. Form tidak bisa dipublikasikan sebelum loop ini
              diperbaiki.
            </p>
          )}

          {tab === "questions" && (
            <fieldset
              disabled={locked}
              className="m-0 grid min-w-0 gap-4 border-0 p-0 xl:grid-cols-[16rem_minmax(0,1fr)]"
            >
              <ElementPalette
                onAddQuestion={() => addItems([newItem("SHORT_ANSWER")])}
                onAddTitle={() => addItems([newItem("TITLE_DESCRIPTION")])}
                onAddImage={() => addItems([newItem("IMAGE")])}
                onAddVideo={() => addItems([newItem("VIDEO")])}
                onAddSection={addSection}
                onImport={() => setImportOpen(true)}
              />
              <div className="min-w-0 space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                  <label
                    htmlFor="form-description"
                    className="mb-1.5 block text-xs font-medium text-gray-600"
                  >
                    Deskripsi form
                  </label>
                  <textarea
                    id="form-description"
                    rows={2}
                    value={settings.description}
                    onChange={(e) =>
                      patchSettings({ description: e.target.value })
                    }
                    maxLength={5000}
                    placeholder="Jelaskan tujuan form ini kepada responden (opsional)"
                    className="min-h-[3.75rem] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-gray-700 sm:text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {sections.map((s, i) => (
                  <SectionCard
                    key={s.uid}
                    formId={formId}
                    section={s}
                    index={i}
                    totalSections={sections.length}
                    active={s.uid === activeUid}
                    targets={targets}
                    numbering={numbering}
                    onActivate={() => setActiveUid(s.uid)}
                    onChangeSection={(patch) => patchSection(s.uid, patch)}
                    onMoveSection={(dir) => moveSection(s.uid, dir)}
                    onDeleteSection={() => deleteSection(s.uid)}
                    onChangeItem={(iUid, patch) =>
                      patchItem(s.uid, iUid, patch)
                    }
                    onChangeItemType={(iUid, t) => changeType(s.uid, iUid, t)}
                    onDuplicateItem={(iUid) => duplicateItem(s.uid, iUid)}
                    onDeleteItem={(iUid) => deleteItem(s.uid, iUid)}
                    onMoveItem={(iUid, dir) => moveItem(s.uid, iUid, dir)}
                  />
                ))}
              </div>
            </fieldset>
          )}

          {tab === "event" && meta.type === "EVENT" && (
            <EventInfoTab
              settings={settings}
              disabled={locked}
              onChange={patchSettings}
            />
          )}

          {tab === "appearance" && (
            <AppearanceTab
              formId={formId}
              settings={settings}
              disabled={locked}
              onChange={patchSettings}
              onHeaderImage={setHeaderImage}
            />
          )}

          {tab === "settings" && (
            <SettingsTab
              formId={formId}
              status={meta.status}
              onLinkSaved={() => setLinkVersion((v) => v + 1)}
              type={meta.type}
              hasEvent={meta.eventName != null}
              settings={settings}
              disabled={locked}
              onChange={patchSettings}
            />
          )}
        </div>
      </div>

      <ImportQuestionsModal
        open={importOpen}
        onOpenChange={setImportOpen}
        currentFormId={formId}
        onImport={addItems}
      />
      <FormPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        settings={settings}
        sections={sections}
        type={meta.type}
      />
    </div>
  );
}
