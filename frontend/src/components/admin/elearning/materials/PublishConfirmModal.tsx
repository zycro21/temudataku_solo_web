"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PublishConfirmModal({
  open,
  onClose,
  onConfirm,
}: Props) {
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
                src="/assets/admin/elearning/streamwarning.svg"
                alt="publish warning"
                width={160}
                height={120}
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Publish this Material?
            </h2>

            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              This will make the material available to learners.
              <br />
              You can still edit it later if needed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-emerald-400 text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition"
              >
                Publish
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
