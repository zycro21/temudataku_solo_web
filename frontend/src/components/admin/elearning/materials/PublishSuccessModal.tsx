"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PublishSuccessModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop (NO CLICK HANDLER) */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Modal */}
          <motion.div
            onClick={(e) => e.stopPropagation()} // ⛔ penting
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-[420px] bg-white rounded-2xl p-6 text-center shadow-xl"
          >
            <div className="flex justify-center mb-4">
              <Image
                src="/assets/admin/elearning/streamwarning2.svg"
                alt="publish success"
                width={160}
                height={120}
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Material Published Successfully!
            </h2>

            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Your material is now live and accessible to learners.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition"
            >
              View Materials
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
