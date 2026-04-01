"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.35, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-[3px] border-transparent border-t-[var(--g)] rounded-full"
        />

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.4 }}
          className="text-xs font-medium tracking-[2px] uppercase text-[var(--tx-3)]"
        >
          LÄDT
        </motion.span>
      </div>
    </div>
  );
}