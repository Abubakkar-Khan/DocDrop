/**
 * HashCompare — Side-by-side hash comparison with character highlighting
 */
import { motion } from "framer-motion";

export default function HashCompare({ hash1, hash2, label1 = "Original Hash", label2 = "Recomputed Hash" }) {
  const match = hash1 === hash2;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-text-muted font-medium block mb-1.5">{label1}</span>
          <div className="bg-surface-alt rounded-lg p-3 font-mono text-xs break-all leading-relaxed">
            {hash1 && hash1.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                className={!match && hash2 && hash2[i] !== char ? "text-error font-bold" : "text-text-secondary"}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs text-text-muted font-medium block mb-1.5">{label2}</span>
          <div className="bg-surface-alt rounded-lg p-3 font-mono text-xs break-all leading-relaxed">
            {hash2 && hash2.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 + 0.5 }}
                className={!match && hash1 && hash1[i] !== char ? "text-error font-bold" : "text-text-secondary"}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className={`text-center py-2 rounded-lg text-sm font-semibold ${match ? "bg-success-50 text-success" : "bg-error-50 text-error"}`}
      >
        {match ? "✓ Hashes Match — Document is Authentic" : "✗ Hashes Do Not Match — Document Tampered!"}
      </motion.div>
    </div>
  );
}
