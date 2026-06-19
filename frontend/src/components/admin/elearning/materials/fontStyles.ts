import type { CSSProperties } from "react";

// ─── Font-type presets ──────────────────────────────────────────────────────
// "Paragraph" is the default (= normal font). Heading 1 is the biggest,
// shrinking down to Heading 3. Caption & Code each have their own look.
export const FONT_PRESETS: Record<
  string,
  {
    fontSize: number;
    fontWeight: number;
    fontStyle?: string;
    fontFamily?: string;
    color?: string;
  }
> = {
  "Heading 1": { fontSize: 32, fontWeight: 700 },
  "Heading 2": { fontSize: 24, fontWeight: 700 },
  "Heading 3": { fontSize: 20, fontWeight: 600 },
  Paragraph: { fontSize: 16, fontWeight: 400 },
  Caption: {
    fontSize: 12,
    fontWeight: 400,
    fontStyle: "italic",
    color: "#6b7280",
  },
  Code: {
    fontSize: 14,
    fontWeight: 400,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
};

// Mapping for serializing fontType into the saved text (short keys, stable
// across renames so old saved data keeps working).
export const FONT_TYPE_KEYS: Record<string, string> = {
  "Heading 1": "heading1",
  "Heading 2": "heading2",
  "Heading 3": "heading3",
  Paragraph: "paragraph",
  Caption: "caption",
  Code: "code",
};

export const FONT_TYPE_KEYS_REVERSE: Record<string, string> = Object.entries(
  FONT_TYPE_KEYS,
).reduce((acc, [label, key]) => ({ ...acc, [key]: label }), {});

export const DEFAULT_FONT_TYPE = "Paragraph";

// Resolve the inline style that should be applied to a text block based on
// its fontType + (optionally overridden) fontSize. fontSize always wins over
// the preset's default size, so every value from 8 → 72 looks different.
export function getFontStyle(
  fontType?: string,
  fontSize?: number,
): CSSProperties {
  const preset =
    FONT_PRESETS[fontType ?? DEFAULT_FONT_TYPE] ?? FONT_PRESETS.Paragraph;
  return {
    fontSize: `${fontSize ?? preset.fontSize}px`,
    fontWeight: preset.fontWeight,
    fontStyle: preset.fontStyle,
    fontFamily: preset.fontFamily,
    color: preset.color,
  };
}
