import { KEY_STYLES } from "./groupStyles";
import type { KeyFlag } from "./types";

export default function KeyBadge({ flag }: { flag: KeyFlag }) {
  return (
    <span
      className={`rounded px-1 text-xs font-semibold leading-5 ${KEY_STYLES[flag]}`}
    >
      {flag}
    </span>
  );
}