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
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <CheckCircle className="w-5 h-5 text-white animate-pulse" />
          </motion.div>
          <span className="font-medium">Feedback</span>
        </Button>
      </DialogTrigger>

      {/* Modal tampil saat tombol diklik */}
      <DialogContent className="bg-white rounded-xl shadow-lg w-full max-w-md p-0">
        <DialogHeader className="px-6 py-5 border-b text-center">
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Anda Telah Memberikan Feedback
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">{feedbackTitle}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {feedbackDate} • {feedbackTime}
          </p>
        </DialogHeader>

        <div className="px-6 py-8 text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="flex justify-center"
          >
            <CheckCircle className="w-16 h-16 text-blue-600" />
          </motion.div>
          <p className="text-gray-700 text-base font-medium">
            Terima kasih! Anda telah memberikan feedback untuk sesi ini.
          </p>
        </div>

        <div className="px-6 py-4 border-t flex justify-center">
          <DialogClose asChild>
            <Button className="w-32 bg-blue-600 hover:bg-blue-700 text-white">
              Tutup
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
