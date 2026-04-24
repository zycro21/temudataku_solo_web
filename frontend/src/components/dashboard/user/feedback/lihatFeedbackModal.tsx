"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface LihatFeedbackModalProps {
  feedbackTitle: string;
  feedbackDate: string;
  feedbackTime: string;
}

export default function LihatFeedbackModal({
  feedbackTitle,
  feedbackDate,
  feedbackTime,
}: LihatFeedbackModalProps) {
  return (
    <Dialog>
      {/* Tombol utama */}
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 text-xs py-1.5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <CheckCircle className="w-4 h-4 text-white" />
          </motion.div>
          <span className="font-medium">Feedback</span>
        </Button>
      </DialogTrigger>

      {/* Modal */}
      <DialogContent
        className="
      bg-white rounded-lg shadow
      w-full max-w-sm
      p-0
      overflow-hidden
    "
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* HEADER */}
        <DialogHeader className="px-4 py-3 border-b text-center space-y-0.5">
          <DialogTitle className="text-sm font-semibold text-gray-800">
            Anda Telah Memberikan Feedback
          </DialogTitle>
          <p className="text-xs text-gray-600">{feedbackTitle}</p>
          <p className="text-[11px] text-gray-500">
            {feedbackDate} • {feedbackTime}
          </p>
        </DialogHeader>

        {/* CONTENT */}
        <div className="px-4 py-5 text-center space-y-3 overflow-x-hidden">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex justify-center"
          >
            <CheckCircle className="w-10 h-10 text-blue-600" />
          </motion.div>

          <p className="text-xs text-gray-700 font-medium leading-relaxed">
            Terima kasih! Anda telah memberikan feedback untuk sesi ini.
          </p>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t flex justify-center">
          <DialogClose asChild>
            <Button className="w-full text-xs py-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              Tutup
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
