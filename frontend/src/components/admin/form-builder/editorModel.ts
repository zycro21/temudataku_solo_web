import type { FormStatus, FormType } from "./shared";

// ─── Tipe sesuai schema backend ──────────────────────────────────────────────
export type ItemType =
  | "SHORT_ANSWER"
  | "PARAGRAPH"
  | "MULTIPLE_CHOICE"
  | "CHECKBOXES"
  | "DROPDOWN"
  | "FILE_UPLOAD"
  | "LINEAR_SCALE"
  | "RATING"
  | "MULTIPLE_CHOICE_GRID"
  | "CHECKBOX_GRID"
  | "DATE"
  | "TIME_DURATION"
  | "TITLE_DESCRIPTION"
  | "IMAGE"
  | "VIDEO";
export type NavAction = "NEXT" | "GO_TO_SECTION" | "SUBMIT";
export type OptionKind = "CHOICE" | "GRID_ROW" | "GRID_COLUMN";
export type ResponderAccess = "ANYONE_WITH_LINK" | "LOGIN_REQUIRED";
export type EventMode = "ONLINE" | "OFFLINE" | "HYBRID";

// Info Event (khusus Form Event). Bentuk dari server (GET /forms/:id)
export interface ApiTimelineItem {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null; // YYYY-MM-DD
  time?: string | null;
}
export interface ApiFaqItem {
  id: string;
  question: string;
  answer: string;
}
// Bentuk di state editor (uid = penanda lokal / id server)
export interface EventTimelineItem {
  uid: string;
  date: string; // "" = kosong
  time: string;
  title: string;
  description: string;
}
export interface EventFaqItem {
  uid: string;
  question: string;
  answer: string;
}

export interface ValidationRule {
  kind: "number" | "text" | "length" | "regex" | "selectCount";
  op: string;
  min?: number;
  max?: number;
  value?: number | string;
  message?: string;
}
export type ItemConfig = Record<string, unknown>;

// ─── Bentuk respons GET /api/form/forms/:id ──────────────────────────────────
export interface ApiOption {
  id: string;
  kind: OptionKind;
  label: string;
  branchAction: NavAction;
  branchSectionId: string | null;
}
export interface ApiItem {
  id: string;
  type: ItemType;
  title: string | null;
  description: string | null;
  isRequired: boolean;
  shuffleOptions: boolean;
  validation: ValidationRule | null;
  config: ItemConfig | null;
  options: ApiOption[];
}
export interface ApiSection {
  id: string;
  title: string | null;
  description: string | null;
  nextAction: NavAction;
  nextSectionId: string | null;
  items: ApiItem[];
}
export interface FormDetail {
  id: string;
  type: FormType;
  status: FormStatus;
  slug: string;
  title: string;
  description: string | null;
  eventNameSnapshot: string | null;
  showOnEventPage: boolean;
  acceptingResponses: boolean;
  responseLimitEnabled: boolean;
  responseLimit: number | null;
  periodEnabled: boolean;
  openAt: string | null;
  closeAt: string | null;
  responderAccess: ResponderAccess;
  collectEmail: boolean;
  limitOneResponsePerAccount: boolean;
  allowEditResponse: boolean;
  sendResponseReceipt: boolean;
  allowResponderDraft: boolean;
  shuffleQuestionOrder: boolean;
  notifyOnNewResponse: boolean;
  confirmationMessage: string | null;
  closedMessage: string | null;
  headerImage: string | null;
  themeColor: string | null;
  backgroundColor: string | null;
  fontPreset: string | null;
  eventTitle: string | null;
  eventDescription: string | null;
  eventStartAt: string | null;
  eventEndAt: string | null;
  eventMode: EventMode | null;
  eventLocation: string | null;
  eventOrganizer: string | null;
  eventCategoryLabel: string | null;
  eventTimeline: ApiTimelineItem[] | null;
  eventFaqs: ApiFaqItem[] | null;
  sections: ApiSection[];
}

// ─── State lokal editor ──────────────────────────────────────────────────────
// uid = penanda lokal. Untuk elemen yang sudah tersimpan uid == id server.
// Rujukan antar-section (tujuan lompat) disimpan sebagai uid section.
export interface EditorOption {
  uid: string;
  id?: string;
  kind: OptionKind;
  label: string;
  branchAction: NavAction;
  branchSectionRef: string | null;
}
export interface EditorItem {
  uid: string;
  id?: string;
  type: ItemType;
  title: string;
  description: string;
  isRequired: boolean;
  shuffleOptions: boolean;
  validation: ValidationRule | null;
  config: ItemConfig | null;
  options: EditorOption[];
}
export interface EditorSection {
  uid: string;
  id?: string;
  title: string;
  description: string;
  nextAction: NavAction;
  nextSectionRef: string | null;
  items: EditorItem[];
}
export interface SectionTarget {
  uid: string;
  label: string;
}

// ─── Kelompok tipe ───────────────────────────────────────────────────────────
export const QUESTION_TYPES: ItemType[] = [
  "SHORT_ANSWER",
  "PARAGRAPH",
  "MULTIPLE_CHOICE",
  "CHECKBOXES",
  "DROPDOWN",
  "FILE_UPLOAD",
  "LINEAR_SCALE",
  "RATING",
  "MULTIPLE_CHOICE_GRID",
  "CHECKBOX_GRID",
  "DATE",
  "TIME_DURATION",
];
const CHOICE_TYPES: ItemType[] = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN"];
const GRID_TYPES: ItemType[] = ["MULTIPLE_CHOICE_GRID", "CHECKBOX_GRID"];
export const BRANCHING_TYPES: ItemType[] = ["MULTIPLE_CHOICE", "DROPDOWN"];
const CONTENT_TYPES: ItemType[] = ["TITLE_DESCRIPTION", "IMAGE", "VIDEO"];

export const isChoice = (t: ItemType) => CHOICE_TYPES.includes(t);
export const isGrid = (t: ItemType) => GRID_TYPES.includes(t);
export const isBranching = (t: ItemType) => BRANCHING_TYPES.includes(t);
export const isAnswerable = (t: ItemType) => !CONTENT_TYPES.includes(t);
export const hasShuffle = (t: ItemType) => isChoice(t) || isGrid(t);

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  SHORT_ANSWER: "Short Answer",
  PARAGRAPH: "Paragraph",
  MULTIPLE_CHOICE: "Multiple Choice",
  CHECKBOXES: "Checkboxes",
  DROPDOWN: "Dropdown",
  FILE_UPLOAD: "File Upload",
  LINEAR_SCALE: "Linear Scale",
  RATING: "Rating",
  MULTIPLE_CHOICE_GRID: "Multiple Choice Grid",
  CHECKBOX_GRID: "Checkbox Grid",
  DATE: "Date",
  TIME_DURATION: "Time / Duration",
  TITLE_DESCRIPTION: "Title & Description",
  IMAGE: "Gambar",
  VIDEO: "Video",
};

// Jenis validasi yang boleh dipakai per tipe (sama dengan backend)
export const ALLOWED_VALIDATION_KINDS: Partial<
  Record<ItemType, ValidationRule["kind"][]>
> = {
  SHORT_ANSWER: ["number", "text", "length", "regex"],
  PARAGRAPH: ["length", "regex"],
  CHECKBOXES: ["selectCount"],
};

export function defaultConfig(type: ItemType): ItemConfig | null {
  switch (type) {
    case "LINEAR_SCALE":
      return { min: 1, max: 5 };
    case "RATING":
      return { max: 5 };
    case "FILE_UPLOAD":
      return { maxFiles: 1, maxSizeMb: 10, allowedTypes: ["pdf", "image"] };
    case "DATE":
      return { includeYear: true };
    case "TIME_DURATION":
      return { mode: "time" };
    case "MULTIPLE_CHOICE_GRID":
      return { requireEachRow: false, oneResponsePerColumn: false };
    case "CHECKBOX_GRID":
      return { requireEachRow: false };
    case "IMAGE":
    case "VIDEO":
      return {};
    default:
      return null;
  }
}

export function defaultRule(kind: ValidationRule["kind"]): ValidationRule {
  switch (kind) {
    case "number":
      return { kind, op: "between" };
    case "text":
      return { kind, op: "email" };
    case "length":
      return { kind, op: "max", value: 100 };
    case "regex":
      return { kind, op: "matches", value: "" };
    default:
      return { kind: "selectCount", op: "atLeast", value: 1 };
  }
}

// ─── Pembuat elemen baru ─────────────────────────────────────────────────────
let seq = 0;
export const newUid = () =>
  `local-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export function newOption(
  label = "",
  kind: OptionKind = "CHOICE",
): EditorOption {
  return {
    uid: newUid(),
    kind,
    label,
    branchAction: "NEXT",
    branchSectionRef: null,
  };
}

function defaultOptions(type: ItemType): EditorOption[] {
  if (isChoice(type)) return [newOption("Opsi 1")];
  if (isGrid(type)) {
    return [
      newOption("Baris 1", "GRID_ROW"),
      newOption("Kolom 1", "GRID_COLUMN"),
    ];
  }
  return [];
}

export function newItem(type: ItemType): EditorItem {
  return {
    uid: newUid(),
    type,
    title: "",
    description: "",
    isRequired: false,
    shuffleOptions: false,
    validation: null,
    config: defaultConfig(type),
    options: defaultOptions(type),
  };
}

export function newSection(): EditorSection {
  return {
    uid: newUid(),
    title: "",
    description: "",
    nextAction: "NEXT",
    nextSectionRef: null,
    items: [],
  };
}

// Ganti tipe pertanyaan: validasi & config tipe lama dibuang, pilihan dipertahankan
// kalau masih sejenis (pilihan → pilihan, grid → grid).
export function changeItemType(item: EditorItem, type: ItemType): EditorItem {
  let options: EditorOption[];
  if (isChoice(type) && isChoice(item.type)) {
    options = item.options.map((o) =>
      isBranching(type)
        ? o
        : { ...o, branchAction: "NEXT" as const, branchSectionRef: null },
    );
  } else if (isGrid(type) && isGrid(item.type)) {
    options = item.options;
  } else {
    options = defaultOptions(type);
  }
  return {
    ...item,
    type,
    validation: null,
    config: defaultConfig(type),
    shuffleOptions: hasShuffle(type) ? item.shuffleOptions : false,
    isRequired: isAnswerable(type) ? item.isRequired : false,
    options,
  };
}

// Salinan untuk "duplikat": semua ID dibuang supaya jadi elemen baru
export function cloneItem(item: EditorItem): EditorItem {
  return {
    ...item,
    uid: newUid(),
    id: undefined,
    validation: item.validation ? { ...item.validation } : null,
    config: item.config ? JSON.parse(JSON.stringify(item.config)) : null,
    options: item.options.map((o) => ({ ...o, uid: newUid(), id: undefined })),
  };
}

// Import dari form lain: rujukan ke section form asal tidak berlaku, jadi
// branching direset ke "lanjut".
export function importItem(it: ApiItem): EditorItem {
  return {
    uid: newUid(),
    type: it.type,
    title: it.title ?? "",
    description: it.description ?? "",
    isRequired: it.isRequired,
    shuffleOptions: it.shuffleOptions,
    validation: it.validation ? { ...it.validation } : null,
    config: it.config ? JSON.parse(JSON.stringify(it.config)) : null,
    options: it.options.map((o) => ({
      uid: newUid(),
      kind: o.kind,
      label: o.label,
      branchAction: "NEXT" as const,
      branchSectionRef: null,
    })),
  };
}

export function sectionTargets(sections: EditorSection[]): SectionTarget[] {
  return sections.map((s, i) => ({
    uid: s.uid,
    label: `Section ${i + 1}${s.title.trim() ? ` – ${s.title.trim()}` : ""}`,
  }));
}

// ─── Pengaturan & tema form (PATCH /forms/:id) ───────────────────────────────
export interface FormSettings {
  title: string;
  description: string;
  showOnEventPage: boolean;
  acceptingResponses: boolean;
  responseLimitEnabled: boolean;
  responseLimit: number | null;
  periodEnabled: boolean;
  openAt: string; // format input datetime-local, "" = kosong
  closeAt: string;
  responderAccess: ResponderAccess;
  collectEmail: boolean;
  limitOneResponsePerAccount: boolean;
  allowEditResponse: boolean;
  sendResponseReceipt: boolean;
  allowResponderDraft: boolean;
  shuffleQuestionOrder: boolean;
  notifyOnNewResponse: boolean;
  confirmationMessage: string;
  closedMessage: string;
  themeColor: string; // "" = pakai default
  backgroundColor: string;
  fontPreset: string;
  headerImage: string | null;
  // Info Event (hanya dipakai kalau type EVENT)
  eventTitle: string;
  eventDescription: string;
  eventStartAt: string; // format input datetime-local, "" = kosong
  eventEndAt: string;
  eventMode: EventMode | "";
  eventLocation: string;
  eventOrganizer: string;
  eventCategoryLabel: string;
  eventTimeline: EventTimelineItem[];
  eventFaqs: EventFaqItem[];
}

export function defaultSettings(): FormSettings {
  return {
    title: "",
    description: "",
    showOnEventPage: true,
    acceptingResponses: true,
    responseLimitEnabled: false,
    responseLimit: null,
    periodEnabled: false,
    openAt: "",
    closeAt: "",
    responderAccess: "ANYONE_WITH_LINK",
    collectEmail: false,
    limitOneResponsePerAccount: false,
    allowEditResponse: false,
    sendResponseReceipt: false,
    allowResponderDraft: false,
    shuffleQuestionOrder: false,
    notifyOnNewResponse: false,
    confirmationMessage: "",
    closedMessage: "",
    themeColor: "",
    backgroundColor: "",
    fontPreset: "",
    headerImage: null,
    eventTitle: "",
    eventDescription: "",
    eventStartAt: "",
    eventEndAt: "",
    eventMode: "",
    eventLocation: "",
    eventOrganizer: "",
    eventCategoryLabel: "",
    eventTimeline: [],
    eventFaqs: [],
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toSettings(d: FormDetail): FormSettings {
  return {
    title: d.title,
    description: d.description ?? "",
    showOnEventPage: d.showOnEventPage,
    acceptingResponses: d.acceptingResponses,
    responseLimitEnabled: d.responseLimitEnabled,
    responseLimit: d.responseLimit ?? null,
    periodEnabled: d.periodEnabled,
    openAt: isoToLocalInput(d.openAt),
    closeAt: isoToLocalInput(d.closeAt),
    responderAccess: d.responderAccess,
    collectEmail: d.collectEmail,
    limitOneResponsePerAccount: d.limitOneResponsePerAccount,
    allowEditResponse: d.allowEditResponse,
    sendResponseReceipt: d.sendResponseReceipt,
    allowResponderDraft: d.allowResponderDraft,
    shuffleQuestionOrder: d.shuffleQuestionOrder,
    notifyOnNewResponse: d.notifyOnNewResponse,
    confirmationMessage: d.confirmationMessage ?? "",
    closedMessage: d.closedMessage ?? "",
    themeColor: d.themeColor ?? "",
    backgroundColor: d.backgroundColor ?? "",
    fontPreset: d.fontPreset ?? "",
    headerImage: d.headerImage ?? null,
    eventTitle: d.eventTitle ?? "",
    eventDescription: d.eventDescription ?? "",
    eventStartAt: isoToLocalInput(d.eventStartAt ?? null),
    eventEndAt: isoToLocalInput(d.eventEndAt ?? null),
    eventMode: d.eventMode ?? "",
    eventLocation: d.eventLocation ?? "",
    eventOrganizer: d.eventOrganizer ?? "",
    eventCategoryLabel: d.eventCategoryLabel ?? "",
    eventTimeline: (d.eventTimeline ?? []).map((t) => ({
      uid: t.id,
      date: t.date ?? "",
      time: t.time ?? "",
      title: t.title,
      description: t.description ?? "",
    })),
    eventFaqs: (d.eventFaqs ?? []).map((f) => ({
      uid: f.id,
      question: f.question,
      answer: f.answer,
    })),
  };
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export function settingsPayload(s: FormSettings, type: FormType) {
  const toIso = (v: string) => (v ? new Date(v).toISOString() : null);
  return {
    title: s.title.trim(),
    description: s.description.trim() || null,
    ...(type === "EVENT"
      ? {
          showOnEventPage: s.showOnEventPage,
          eventTitle: s.eventTitle.trim() || null,
          eventDescription: s.eventDescription.trim() || null,
          eventStartAt: toIso(s.eventStartAt),
          eventEndAt: toIso(s.eventEndAt),
          eventMode: s.eventMode || null,
          eventLocation: s.eventLocation.trim() || null,
          eventOrganizer: s.eventOrganizer.trim() || null,
          eventCategoryLabel: s.eventCategoryLabel.trim() || null,
          eventTimeline: s.eventTimeline.map((t) => ({
            id: t.uid,
            title: t.title.trim(),
            description: t.description.trim() || null,
            date: t.date || null,
            time: t.time.trim() || null,
          })),
          eventFaqs: s.eventFaqs.map((f) => ({
            id: f.uid,
            question: f.question.trim(),
            answer: f.answer.trim(),
          })),
        }
      : {}),
    acceptingResponses: s.acceptingResponses,
    responseLimitEnabled: s.responseLimitEnabled,
    responseLimit: s.responseLimitEnabled ? s.responseLimit : null,
    periodEnabled: s.periodEnabled,
    openAt: s.periodEnabled ? toIso(s.openAt) : null,
    closeAt: s.periodEnabled ? toIso(s.closeAt) : null,
    responderAccess: s.responderAccess,
    collectEmail: s.collectEmail,
    limitOneResponsePerAccount: s.limitOneResponsePerAccount,
    allowEditResponse: s.allowEditResponse,
    sendResponseReceipt: s.sendResponseReceipt,
    allowResponderDraft: s.allowResponderDraft,
    shuffleQuestionOrder: s.shuffleQuestionOrder,
    notifyOnNewResponse: s.notifyOnNewResponse,
    confirmationMessage: s.confirmationMessage.trim() || null,
    closedMessage: s.closedMessage.trim() || null,
    themeColor: HEX.test(s.themeColor) ? s.themeColor : null,
    backgroundColor: HEX.test(s.backgroundColor) ? s.backgroundColor : null,
    fontPreset: s.fontPreset || null,
  };
}

export function validateSettings(s: FormSettings): string | null {
  if (!s.title.trim()) return "Judul form tidak boleh kosong";
  if (s.responseLimitEnabled && (!s.responseLimit || s.responseLimit < 1)) {
    return "Pengaturan: isi jumlah maksimum responden";
  }
  if (s.periodEnabled) {
    if (!s.openAt || !s.closeAt) {
      return "Pengaturan: tanggal mulai dan selesai periode wajib diisi";
    }
    if (new Date(s.closeAt) <= new Date(s.openAt)) {
      return "Pengaturan: tanggal selesai harus setelah tanggal mulai";
    }
  }
  if (s.themeColor && !HEX.test(s.themeColor)) {
    return "Tampilan: warna tema harus format hex, contoh #10B981";
  }
  if (s.backgroundColor && !HEX.test(s.backgroundColor)) {
    return "Tampilan: warna latar harus format hex, contoh #F8FAFC";
  }
  if (
    s.eventStartAt &&
    s.eventEndAt &&
    new Date(s.eventEndAt) < new Date(s.eventStartAt)
  ) {
    return "Info Event: tanggal selesai tidak boleh sebelum tanggal mulai";
  }
  const tl = s.eventTimeline.findIndex((t) => !t.title.trim());
  if (tl >= 0) return `Info Event: judul timeline ke-${tl + 1} wajib diisi`;
  const fq = s.eventFaqs.findIndex(
    (f) => !f.question.trim() || !f.answer.trim(),
  );
  if (fq >= 0)
    return `Info Event: pertanyaan dan jawaban FAQ ke-${fq + 1} wajib diisi`;
  return null;
}

// ─── Server → state editor ───────────────────────────────────────────────────
export function toEditorSections(d: FormDetail): EditorSection[] {
  const sections = d.sections.map<EditorSection>((s) => ({
    uid: s.id,
    id: s.id,
    title: s.title ?? "",
    description: s.description ?? "",
    nextAction: s.nextAction,
    nextSectionRef: s.nextSectionId ?? null,
    items: s.items.map<EditorItem>((it) => ({
      uid: it.id,
      id: it.id,
      type: it.type,
      title: it.title ?? "",
      description: it.description ?? "",
      isRequired: it.isRequired,
      shuffleOptions: it.shuffleOptions,
      validation: it.validation ?? null,
      config: it.config ?? null,
      options: it.options.map<EditorOption>((o) => ({
        uid: o.id,
        id: o.id,
        kind: o.kind,
        label: o.label,
        branchAction: o.branchAction,
        branchSectionRef: o.branchSectionId ?? null,
      })),
    })),
  }));
  return sections.length > 0 ? sections : [newSection()];
}

// ─── State editor → payload PUT /forms/:id/structure ─────────────────────────
const maybe = <T extends object>(cond: unknown, obj: T): Partial<T> =>
  cond ? obj : {};

function cleanRule(r: ValidationRule | null): ValidationRule | null {
  if (!r) return null;
  const out: ValidationRule = { kind: r.kind, op: r.op };
  const msg = r.message?.trim();
  if (msg) out.message = msg;
  switch (r.kind) {
    case "number":
      if (r.op === "between" || r.op === "notBetween") {
        out.min = r.min;
        out.max = r.max;
      } else if (r.op !== "integer") {
        out.value = r.value;
      }
      break;
    case "text":
      if (r.op === "contains" || r.op === "notContains") {
        out.value = typeof r.value === "string" ? r.value.trim() : undefined;
      }
      break;
    case "regex":
      out.value = String(r.value ?? "");
      break;
    default:
      out.value = r.value;
  }
  return out;
}

function cleanConfig(c: ItemConfig | null): ItemConfig | null {
  if (!c) return null;
  const out: ItemConfig = {};
  for (const [k, v] of Object.entries(c)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "number" && Number.isNaN(v)) continue;
    if (typeof v === "string") {
      if (!v.trim()) continue;
      out[k] = v.trim();
      continue;
    }
    out[k] = v;
  }
  return out;
}

export function toPayload(sections: EditorSection[]) {
  // Tujuan lompat: section lama dirujuk lewat id, section baru lewat key
  const target = (ref: string | null) => {
    const t = sections.find((s) => s.uid === ref);
    if (!t) return null;
    return t.id ? { id: t.id } : { key: t.uid };
  };
  const nextRef = (ref: string | null) => {
    const t = target(ref);
    if (!t) return {};
    return "id" in t ? { nextSectionId: t.id } : { nextSectionKey: t.key };
  };
  const branchRef = (ref: string | null) => {
    const t = target(ref);
    if (!t) return {};
    return "id" in t ? { branchSectionId: t.id } : { branchSectionKey: t.key };
  };

  return {
    sections: sections.map((s) => ({
      ...(s.id ? { id: s.id } : { key: s.uid }),
      ...maybe(s.title.trim(), { title: s.title.trim() }),
      ...maybe(s.description.trim(), { description: s.description.trim() }),
      nextAction: s.nextAction,
      ...(s.nextAction === "GO_TO_SECTION" ? nextRef(s.nextSectionRef) : {}),
      items: s.items.map((it) => ({
        ...maybe(it.id, { id: it.id }),
        type: it.type,
        ...maybe(it.title.trim(), { title: it.title.trim() }),
        ...maybe(it.description.trim(), {
          description: it.description.trim(),
        }),
        isRequired: isAnswerable(it.type) ? it.isRequired : false,
        shuffleOptions: hasShuffle(it.type) ? it.shuffleOptions : false,
        ...maybe(it.validation, { validation: cleanRule(it.validation) }),
        ...maybe(it.config, { config: cleanConfig(it.config) }),
        options: it.options.map((o) => ({
          ...maybe(o.id, { id: o.id }),
          kind: o.kind,
          label: o.label.trim(),
          branchAction: isBranching(it.type) ? o.branchAction : "NEXT",
          ...(isBranching(it.type) && o.branchAction === "GO_TO_SECTION"
            ? branchRef(o.branchSectionRef)
            : {}),
        })),
      })),
    })),
  };
}

// ─── Cek lokal sebelum kirim ─────────────────────────────────────────────────
function ruleProblem(r: ValidationRule): string | null {
  const num = (v: unknown): v is number =>
    typeof v === "number" && !Number.isNaN(v);
  switch (r.kind) {
    case "number":
      if (r.op === "between" || r.op === "notBetween") {
        if (!num(r.min) || !num(r.max) || r.min > r.max) {
          return "validasi angka: isi min dan max (min tidak boleh lebih besar dari max)";
        }
      } else if (r.op !== "integer" && !num(r.value)) {
        return "validasi angka: nilai belum diisi";
      }
      return null;
    case "text":
      if (
        (r.op === "contains" || r.op === "notContains") &&
        !(typeof r.value === "string" && r.value.trim())
      ) {
        return "validasi teks: kata yang dicari belum diisi";
      }
      return null;
    case "length":
    case "selectCount":
      if (!num(r.value) || !Number.isInteger(r.value) || r.value < 0) {
        return "validasi: nilai harus bilangan bulat";
      }
      if (r.kind === "selectCount" && r.value < 1) {
        return "validasi jumlah pilihan: minimal 1";
      }
      return null;
    case "regex":
      try {
        new RegExp(String(r.value ?? ""));
      } catch {
        return "validasi regex: pola tidak valid";
      }
      return String(r.value ?? "") ? null : "validasi regex: pola belum diisi";
  }
}

export function validateLocal(sections: EditorSection[]): string | null {
  for (const [si, s] of sections.entries()) {
    for (const [ii, it] of s.items.entries()) {
      const where = `Section ${si + 1}, item ${ii + 1}`;
      if (
        (isChoice(it.type) || isGrid(it.type)) &&
        it.options.some((o) => !o.label.trim())
      ) {
        return `${where}: ada pilihan / baris / kolom yang masih kosong`;
      }
      if (it.validation) {
        const p = ruleProblem(it.validation);
        if (p) return `${where}: ${p}`;
      }
      if (it.type === "IMAGE" || it.type === "VIDEO") {
        const url = String(it.config?.url ?? "").trim();
        if (
          url &&
          !url.startsWith("/uploads/formMediaContents/") &&
          !/^https?:\/\//i.test(url)
        ) {
          return `${where}: link harus diawali http:// atau https://`;
        }
      }
    }
  }
  return null;
}

// Loop alur section (sama seperti pengecekan backend saat publish)
export function findLoop(sections: EditorSection[]): string | null {
  const ids = new Set(sections.map((s) => s.uid));
  const edges = new Map<string, string[]>();

  sections.forEach((s, i) => {
    const out = new Set<string>();
    const def =
      s.nextAction === "NEXT"
        ? sections[i + 1]?.uid
        : s.nextAction === "GO_TO_SECTION"
          ? s.nextSectionRef
          : null;
    if (def && ids.has(def)) out.add(def);
    for (const it of s.items) {
      if (!isBranching(it.type)) continue;
      for (const o of it.options) {
        if (
          o.branchAction === "GO_TO_SECTION" &&
          o.branchSectionRef &&
          ids.has(o.branchSectionRef)
        ) {
          out.add(o.branchSectionRef);
        }
      }
    }
    edges.set(s.uid, [...out]);
  });

  const color = new Map<string, number>();
  const stack: string[] = [];
  let cycle: string[] | null = null as string[] | null;
  const dfs = (id: string) => {
    color.set(id, 1);
    stack.push(id);
    for (const next of edges.get(id) ?? []) {
      if (cycle) return;
      const c = color.get(next);
      if (c === 1) {
        cycle = [...stack.slice(stack.indexOf(next)), next];
        return;
      }
      if (!c) dfs(next);
    }
    stack.pop();
    color.set(id, 2);
  };
  if (sections.length > 0) dfs(sections[0].uid);

  if (!cycle) return null;
  const name = (id: string) =>
    `Section ${sections.findIndex((s) => s.uid === id) + 1}`;
  return `Alur section membentuk loop: ${(cycle as string[]).map(name).join(" → ")}`;
}
