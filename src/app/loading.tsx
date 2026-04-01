import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center gap-6">
        {/* Ultra-clean gold spinner – no Pokémon, no colors */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          className="w-7 h-7 border-2 border-transparent border-t-[var(--g)] rounded-full"
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-medium tracking-[0.125em] text-[var(--tx-3)]"
        >
          LÄDT
        </motion.span>
      </div>
    </div>
  );
}