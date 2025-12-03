"use client";

import { useEffect } from "react";

export default function Maintenance() {
  useEffect(() => {
    const block = (e: any) => e.preventDefault();

    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("paste", block);
    document.addEventListener("selectstart", block);
    document.addEventListener("dragstart", block);

    const blockKeys = (e: KeyboardEvent) => {
      if (e.key === "F12") e.preventDefault();
      if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key))
        e.preventDefault();
      if (e.ctrlKey && e.key === "U") e.preventDefault();
      if (e.ctrlKey && ["=", "-", "0"].includes(e.key)) e.preventDefault();
    };

    document.addEventListener("keydown", blockKeys);

    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          window.location.href = "/";
        }
      } else {
        devtoolsOpen = false;
      }
    };

    const interval = setInterval(checkDevTools, 500);

    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("selectstart", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("keydown", blockKeys);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="h-screen w-full flex justify-center items-center select-none pointer-events-none relative overflow-hidden px-4"
      style={{
        background: "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)",
      }}
    >
      {/* Background Effects */}
      <div className="glitch-bg absolute w-56 md:w-72 h-56 md:h-72 rounded-full bg-emerald-100 top-10 left-5 opacity-40 blur-3xl" />
      <div className="glitch-bg absolute w-72 md:w-96 h-72 md:h-96 rounded-full bg-emerald-200 bottom-10 right-5 opacity-30 blur-2xl" />

      {/* Card */}
      <div
        className="bg-white shadow-xl rounded-3xl p-6 md:p-10 w-full max-w-sm md:max-w-md text-center border border-emerald-100 pointer-events-auto relative"
        style={{ animation: "slideUp 0.8s ease-out" }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5 md:mb-6">
          <div className="glitch-icon w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-emerald-100 shadow-inner">
            <span className="text-4xl md:text-5xl">🔧</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="glitch-text text-2xl md:text-3xl font-bold text-emerald-700 mb-3">
          Website Maintenance
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-sm md:text-base leading-relaxed animate-fadeInDelay">
          Kami sedang melakukan perbaikan untuk meningkatkan layanan. Silakan
          kembali beberapa saat lagi.
        </p>
      </div>

      <style>{`
        /* SlideUp */
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Delay Fade */
        @keyframes fadeInDelay {
          0% { opacity: 0; }
          40% { opacity: 0; }
          100% { opacity: 1; }
        }

        /* 🔥 Continuous Glitch Effect Text */
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -1px); }
        }

        /* 🔥 Stronger glitch with slices */
        @keyframes glitch-slice {
          0% { clip-path: inset(0 0 80% 0); }
          20% { clip-path: inset(10% 0 60% 0); }
          40% { clip-path: inset(40% 0 20% 0); }
          60% { clip-path: inset(20% 0 50% 0); }
          80% { clip-path: inset(30% 0 20% 0); }
          100% { clip-path: inset(0 0 80% 0); }
        }

        .glitch-text {
          animation: glitch 1.7s infinite ease-in-out;
          position: relative;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          overflow: hidden;
          animation: glitch-slice 1.2s infinite linear;
        }

        .glitch-text::before {
          color: #34d399;
          z-index: -1;
        }

        .glitch-text::after {
          color: #10b981;
          z-index: -1;
        }

        /* 🔥 Icon Glitch */
        .glitch-icon {
          animation: glitch 1.8s infinite;
        }

        /* 🔥 Background Subtle Glitch */
        .glitch-bg {
          animation: glitch 3.5s infinite;
        }
      `}</style>
    </div>
  );
}
