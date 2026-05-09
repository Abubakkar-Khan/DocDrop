/**
 * SigningStep — Step 2: RSA private key signing visualization
 */
import { motion } from "framer-motion";
import ExplainButton from "../ExplainButton";
import { HiOutlineKey, HiOutlineArrowRight, HiOutlineLockClosed } from "react-icons/hi2";
import { formatSignature, maskKey } from "../../utils/formatters";

export default function SigningStep({ data }) {
  const hash = data.hash_value || data.original_hash || "";
  const signature = data.signature || "";
  const privateKeyPreview = data.private_key_preview || "-----BEGIN PRIVATE KEY-----\n...[MASKED]...\n-----END PRIVATE KEY-----";

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span>
          Signing — RSA-PSS
        </h3>
        <ExplainButton step="signing" />
      </div>

      <div className="flex items-stretch gap-4">
        {/* Inputs */}
        <div className="flex-1 space-y-3">
          {/* Hash input */}
          <div className="bg-surface-alt rounded-xl p-3 border border-border">
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">Document Hash</span>
            <p className="text-xs font-mono text-text-secondary break-all">{hash}</p>
          </div>
          {/* Private key */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-error-50 rounded-xl p-3 border border-error/10"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <HiOutlineKey className="w-3 h-3 text-error" />
              <span className="text-[10px] font-medium text-error uppercase tracking-wider">Private Key (Secret!)</span>
            </div>
            <p className="text-xs font-mono text-error/70 break-all">{privateKeyPreview}</p>
          </motion.div>
        </div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="shrink-0 flex flex-col items-center justify-center gap-1"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HiOutlineLockClosed className="w-4 h-4 text-primary" />
          </div>
          <HiOutlineArrowRight className="w-5 h-5 text-primary" />
          <span className="text-[10px] text-text-light">RSA-PSS</span>
        </motion.div>

        {/* Output */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="flex-1 bg-primary-50 rounded-xl p-4 border border-primary/10 flex flex-col justify-center"
        >
          <span className="text-xs font-medium text-primary uppercase tracking-wider block mb-2">Digital Signature</span>
          <p className="text-xs font-mono text-primary-dark break-all leading-relaxed">
            {formatSignature(signature)}
          </p>
          <p className="text-[10px] text-text-light mt-2">Base64 encoded · RSA-2048 · {data.signature_algorithm || "PSS"}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
