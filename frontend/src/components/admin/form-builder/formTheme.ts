// Pilihan tema yang disediakan sistem. `key` disimpan di Form.fontPreset;
// renderer responden nanti cukup memakai fontStack(key) yang sama.
export interface FontPreset {
  key: string;
  label: string;
  stack: string;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    key: "sans",
    label: "Sans Serif (default)",
    stack: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
  },
  {
    key: "serif",
    label: "Serif",
    stack: "Georgia, Cambria, 'Times New Roman', serif",
  },
  {
    key: "rounded",
    label: "Rounded",
    stack: "'Nunito', 'Quicksand', ui-rounded, system-ui, sans-serif",
  },
  {
    key: "mono",
    label: "Monospace",
    stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
];

export const DEFAULT_THEME_COLOR = "#10B981";
export const DEFAULT_BACKGROUND_COLOR = "#F8FAFC";

export function fontStack(key: string | null | undefined): string {
  return (FONT_PRESETS.find((f) => f.key === key) ?? FONT_PRESETS[0]).stack;
}

// URL media hasil upload (/uploads/formMediaContents/...) dilayani backend
export function mediaSrc(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`;
}
