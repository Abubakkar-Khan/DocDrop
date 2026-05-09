/**
 * TransmissionStep — Step 3: Document + signature transmission
 */
import { motion } from "framer-motion";
import ExplainButton from "../ExplainButton";
import { HiOutlineDocumentText, HiOutlineFingerPrint, HiOutlineUser, HiOutlineArrowRight } from "react-icons/hi2";

export default function TransmissionStep({ data }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</span>
          Transmission
        </h3>
        <ExplainButton step="transmission" />
      </div>

      <div className="flex items-center gap-6">
        {/* Sender */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <HiOutlineUser className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs font-medium text-text">{data.sender_username || "Sender"}</span>
        </motion.div>

        {/* Transmitted Data */}
        <div className="flex-1">
          {/* Arrow animation */}
          <div className="relative h-1 bg-border rounded-full mb-4 overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
            />
          </div>

          {/* Package contents */}
          <div className="bg-surface-alt rounded-xl p-4 border border-border space-y-2">
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2">Transmitted Bundle</p>
            <div className="flex items-center gap-2 text-xs">
              <HiOutlineDocumentText className="w-4 h-4 text-primary shrink-0" />
              <span className="text-text-secondary">{data.original_filename || "document.docx"}</span>
              <span className="badge bg-primary-50 text-primary">Document</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <HiOutlineFingerPrint className="w-4 h-4 text-success shrink-0" />
              <span className="text-text-secondary font-mono truncate">{data.signature?.substring(0, 40)}...</span>
              <span className="badge bg-success-50 text-success">Signature</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <HiOutlineUser className="w-4 h-4 text-text-muted shrink-0" />
              <span className="text-text-secondary">Sender: {data.sender_username}</span>
              <span className="badge bg-surface-alt text-text-muted">Identity</span>
            </div>
          </div>

          <div className="relative h-1 bg-border rounded-full mt-4 overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
            />
          </div>
        </div>

        {/* Receiver */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
            <HiOutlineUser className="w-6 h-6 text-success" />
          </div>
          <span className="text-xs font-medium text-text">Receiver</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
