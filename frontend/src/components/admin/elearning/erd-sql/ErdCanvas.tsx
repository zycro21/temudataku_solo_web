"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RelationDef, TableDef } from "./types";
import TableCard from "./TableCard";

type Pt = [number, number];
interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  w: number;
  h: number;
}
type Rects = Record<string, Rect>;

const COLOR = { idle: "#94a3b8", active: "#10b981", muted: "#e2e8f0" };

// Titik di dalam irisan dua rentang (supaya garis selalu menempel di kedua kartu)
const between = (a0: number, a1: number, b0: number, b1: number, f: number) => {
  const s = Math.max(a0, b0);
  const e = Math.min(a1, b1);
  return s + (e - s) * f;
};

// Jalur garis per relasi. Posisi dihitung dari ukuran kartu hasil pengukuran,
// jadi tetap pas walau ukuran font browser berubah.
function buildRoute(id: string, R: Rects): Pt[] | null {
  const horizontal = (a: Rect, b: Rect, f: number): Pt[] => {
    const y = between(a.top, a.bottom, b.top, b.bottom, f);
    return a.left < b.left
      ? [
          [a.right, y],
          [b.left, y],
        ]
      : [
          [a.left, y],
          [b.right, y],
        ];
  };
  const vertical = (a: Rect, b: Rect): Pt[] => {
    const x = between(a.left, a.right, b.left, b.right, 0.5);
    return [
      [x, a.bottom],
      [x, b.top],
    ];
  };

  switch (id) {
    case "customer-customeraddress":
      return R.Customer && R.CustomerAddress
        ? horizontal(R.Customer, R.CustomerAddress, 0.4)
        : null;
    case "customeraddress-salesorder":
      return R.CustomerAddress && R.SalesOrder
        ? vertical(R.CustomerAddress, R.SalesOrder)
        : null;
    case "product-orders":
      return R.Product && R.Orders ? vertical(R.Product, R.Orders) : null;
    case "salesorder-orders":
      return R.SalesOrder && R.Orders
        ? horizontal(R.SalesOrder, R.Orders, 0.35)
        : null;
    case "salesorder-payment":
      return R.SalesOrder && R.Payment
        ? horizontal(R.SalesOrder, R.Payment, 0.75)
        : null;
    case "salesorder-shipment":
      return R.SalesOrder && R.Shipment
        ? vertical(R.SalesOrder, R.Shipment)
        : null;
    case "orders-review":
      return R.Orders && R.Review ? vertical(R.Orders, R.Review) : null;
    case "customer-salesorder": {
      const {
        Customer: c,
        CustomerAddress: a,
        Product: p,
        Payment: pay,
        SalesOrder: s,
      } = R;
      if (!c || !a || !p || !pay || !s) return null;
      const rowGapY =
        (Math.max(c.bottom, a.bottom, p.bottom) + Math.min(pay.top, s.top)) / 2;
      const gapX = (pay.right + s.left) / 2;
      const startX = c.left + c.w * 0.75;
      const endY = s.top + s.h * 0.3;
      return [
        [startX, c.bottom],
        [startX, rowGapY],
        [gapX, rowGapY],
        [gapX, endY],
        [s.left, endY],
      ];
    }
    default:
      return null;
  }
}

// Posisi label kardinalitas di dekat ujung garis
function labelAt(end: Pt, next: Pt): Pt {
  const dx = next[0] - end[0];
  const dy = next[1] - end[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return [end[0] + ux * 18 + uy * 11, end[1] + uy * 18 - ux * 11];
}

interface Props {
  tables: TableDef[];
  relations: RelationDef[];
  selected: string | null;
  onSelect: (name: string) => void;
}

export default function ErdCanvas({
  tables,
  relations,
  selected,
  onSelect,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [rects, setRects] = useState<Rects>({});
  const [size, setSize] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wb = wrap.getBoundingClientRect();
    const next: Rects = {};
    for (const [name, el] of Object.entries(cardRefs.current)) {
      if (!el) continue;
      const b = el.getBoundingClientRect();
      next[name] = {
        left: b.left - wb.left,
        top: b.top - wb.top,
        right: b.right - wb.left,
        bottom: b.bottom - wb.top,
        w: b.width,
        h: b.height,
      };
    }
    setRects(next);
    setSize({ w: wb.width, h: wb.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    Object.values(cardRefs.current).forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const relatedTables = useMemo(() => {
    const set = new Set<string>();
    if (!selected) return set;
    relations.forEach((r) => {
      if (r.parent === selected) set.add(r.child);
      if (r.child === selected) set.add(r.parent);
    });
    return set;
  }, [relations, selected]);

  const edges = relations
    .map((rel) => ({ rel, pts: buildRoute(rel.id, rects) }))
    .filter((e): e is { rel: RelationDef; pts: Pt[] } => !!e.pts);

  return (
    <div
      className="overflow-x-auto rounded-xl border border-gray-200 bg-slate-50"
      style={{
        backgroundImage:
          "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
        backgroundSize: "1.25rem 1.25rem",
      }}
    >
      <div
        ref={wrapRef}
        className="relative grid min-w-[62rem] grid-cols-3 gap-x-24 gap-y-16 p-6"
      >
        <svg
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={size.w}
          height={size.h}
          aria-hidden="true"
        >
          <defs>
            {(Object.keys(COLOR) as (keyof typeof COLOR)[]).map((k) => (
              <marker
                key={k}
                id={`erd-arrow-${k}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M0 0L10 5L0 10z" fill={COLOR[k]} />
              </marker>
            ))}
          </defs>
          {edges.map(({ rel, pts }) => {
            const active = selected === rel.parent || selected === rel.child;
            const state = active ? "active" : selected ? "muted" : "idle";
            const color = COLOR[state];
            const p0 = pts[0];
            const pn = pts[pts.length - 1];
            const [px, py] = labelAt(p0, pts[1]);
            const [cx, cy] = labelAt(pn, pts[pts.length - 2]);
            return (
              <g key={rel.id}>
                <polyline
                  points={pts.map((p) => p.join(",")).join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={active ? 2.5 : 1.5}
                  strokeLinejoin="round"
                  markerEnd={`url(#erd-arrow-${state})`}
                />
                <circle cx={p0[0]} cy={p0[1]} r={3.5} fill={color} />
                {state !== "muted" && (
                  <>
                    <text
                      x={px}
                      y={py}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={active ? "#047857" : "#64748b"}
                      style={{ fontSize: "0.75rem", fontWeight: 600 }}
                    >
                      {rel.parentLabel}
                    </text>
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={active ? "#047857" : "#64748b"}
                      style={{ fontSize: "0.75rem", fontWeight: 600 }}
                    >
                      {rel.childLabel}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {tables.map((t) => (
          <TableCard
            key={t.name}
            table={t}
            selected={selected === t.name}
            related={relatedTables.has(t.name)}
            dimmed={
              !!selected && selected !== t.name && !relatedTables.has(t.name)
            }
            onSelect={() => onSelect(t.name)}
            registerRef={(el) => {
              cardRefs.current[t.name] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}
