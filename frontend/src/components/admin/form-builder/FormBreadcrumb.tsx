import Link from "next/link";
import { formListHref } from "./shared";

// Breadcrumb lanjutan wizard: "Form Builder › Buat Form › Pilih Jenis › ..."
export default function FormBreadcrumb({ crumbs }: { crumbs: string[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400"
    >
      <Link href={formListHref} className="hover:text-gray-600">
        Form Builder
      </Link>
      {crumbs.map((c, i) => (
        <span key={`${c}-${i}`} className="flex items-center gap-1.5">
          <span>›</span>
          <span className={i === crumbs.length - 1 ? "text-gray-600" : ""}>
            {c}
          </span>
        </span>
      ))}
    </nav>
  );
}
