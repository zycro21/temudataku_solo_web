"use client";

import { Newspaper, Sparkles } from "lucide-react";

export default function ArticleEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-emerald-50 px-6 py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 -m-4 rounded-full bg-emerald-200/50 animate-ping" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 animate-article-empty-float">
          <Newspaper size={36} className="text-emerald-600" />
        </div>
        <Sparkles
          size={18}
          className="absolute -right-2 -top-2 text-emerald-400 animate-pulse"
        />
        <Sparkles
          size={14}
          className="absolute -left-3 bottom-0 text-emerald-300 animate-pulse [animation-delay:0.6s]"
        />
      </div>

      <h3 className="text-lg md:text-xl font-bold text-gray-900">
        Artikel Segera Hadir!
      </h3>
      <p className="mt-2 max-w-md text-sm md:text-base text-gray-500">
        Tim TemuDataku sedang menyiapkan artikel-artikel menarik seputar data,
        AI, dan karier untukmu. Nantikan update-nya, ya!
      </p>

      <style>{`
        @keyframes article-empty-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-article-empty-float {
          animation: article-empty-float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
