"use client";

import { Button } from "@/components/ui/button";

interface NavItem {
  id: string;
  title: string;
  moduleTitle: string;
}

interface Props {
  prev: NavItem | null;
  next: NavItem | null;
  onNavigate: (sm: any) => void;
}

export default function SubchapterFooter({ prev, next, onNavigate }: Props) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-[#F8FAFC] border-t border-gray-200 z-50">
      <div className="h-full flex items-center justify-between px-6">
        {/* PREV */}
        <Button
          variant="ghost"
          disabled={!prev}
          onClick={() => prev && onNavigate(prev)}
          className="flex items-center gap-3 text-left disabled:opacity-40"
        >
          {/* ICON */}
          <div className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-500">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>

          {/* TEXT */}
          <div className="leading-tight">
            <p className="text-[11px] text-gray-500">{prev?.moduleTitle}</p>
            <p className="text-xs font-semibold text-gray-800">{prev?.title}</p>
          </div>
        </Button>

        {/* NEXT */}
        <Button
          variant="ghost"
          disabled={!next}
          onClick={() => next && onNavigate(next)}
          className="flex items-center gap-3 text-right disabled:opacity-40"
        >
          {/* TEXT */}
          <div className="leading-tight">
            <p className="text-[11px] text-gray-500">{next?.moduleTitle}</p>
            <p className="text-xs font-semibold text-gray-800">{next?.title}</p>
          </div>

          {/* ICON */}
          <div className="w-8 h-8 flex items-center justify-center rounded-full border border-emerald-500">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Button>
      </div>
    </footer>
  );
}
