/**
 * VerificationStep — Step 4: Hash comparison and result
 */
import { motion } from "framer-motion";
import ExplainButton from "../ExplainButton";
import HashCompare from "../HashCompare";
import { HiOutlineKey, HiOutlineLockOpen } from "react-icons/hi2";
import { maskKey } from "../../utils/formatters";

export default function VerificationStep({ data }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">4</span>
          Verification — Compare Hashes
        </h3>
        <ExplainButton step="verification" />
      </div>

      {/* Public key used */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-success-50 rounded-xl p-3 border border-success/10"
      >
        <div className="flex items-center gap-1.5 mb-1">
          <HiOutlineKey className="w-3 h-3 text-success" />
          <span className="text-[10px] font-medium text-success uppercase tracking-wider">
            Sender's Public Key (Used for Decryption)
          </span>
        </div>
        <p className="text-xs font-mono text-success/70 truncate">
          {data.sender_public_key ? maskKey(data.sender_public_key).split('\n')[0] + '...' : 'Public key'}
        </p>
      </motion.div>

      {/* Decryption indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-3 py-2"
      >
        <div className="flex-1 h-px bg-border" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt rounded-full">
          <HiOutlineLockOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-text-muted">Signature Decrypted → Original Hash Recovered</span>
        </div>
        <div className="flex-1 h-px bg-border" />
      </motion.div>

      {/* Hash Comparison */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <HashCompare
          hash1={data.original_hash}
          hash2={data.recomputed_hash}
          label1="Hash from Signature (Decrypted)"
          label2="Hash of Received Document"
        />
      </motion.div>
    </motion.div>
  );
}
