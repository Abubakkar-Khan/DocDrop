/**
 * HashingStep — Step 1: SHA-256 hash visualization
 */
import { motion } from "framer-motion";
import ExplainButton from "../ExplainButton";
import { HiOutlineDocumentText, HiOutlineArrowRight } from "react-icons/hi2";

export default function HashingStep({ data }) {
  const textPreview = data.original_text?.substring(0, 200) || "";
  const hash = data.hash_value || data.recomputed_hash || data.original_hash || "";

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>
          Hashing — SHA-256
        </h3>
        <ExplainButton step="hashing" />
      </div>

      <div className="flex items-center gap-4">
        {/* Input: Document text */}
        <div className="flex-1 bg-surface-alt rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineDocumentText className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Original Text</span>
          </div>
          <p className="text-xs text-text-secondary font-mono leading-relaxed max-h-24 overflow-y-auto">
            {textPreview}{textPreview.length >= 200 ? "..." : ""}
          </p>
        </div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="shrink-0 flex flex-col items-center gap-1"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">SHA</span>
          </div>
          <HiOutlineArrowRight className="w-5 h-5 text-primary" />
          <span className="text-[10px] text-text-light">256-bit</span>
        </motion.div>

        {/* Output: Hash */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex-1 bg-primary-50 rounded-xl p-4 border border-primary/10"
        >
          <span className="text-xs font-medium text-primary uppercase tracking-wider block mb-2">Hash Output</span>
          <div className="font-mono text-xs text-primary-dark break-all leading-relaxed">
            {hash.split("").map((char, i) => (
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.015 }}>
                {char}
              </motion.span>
            ))}
          </div>
          <p className="text-[10px] text-text-light mt-2">64 hexadecimal characters = 256 bits</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
