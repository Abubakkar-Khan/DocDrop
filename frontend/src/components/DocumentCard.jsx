/**
 * DocumentCard — Reusable document list item
 */
import { motion } from "framer-motion";
import {
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineUser,
} from "react-icons/hi2";
import { formatDate, getStatusColor } from "../utils/formatters";

export default function DocumentCard({ document, onClick, showSender = true }) {
  const statusLabel = {
    pending: "Pending",
    signed: "Signed",
    sent: "Sent",
    verified: "Verified ✓",
    tampered: "Tampered ✗",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      onClick={onClick}
      className="card-hover p-4 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
          <HiOutlineDocumentText className="w-5 h-5 text-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text truncate">
            {document.original_filename}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
            {showSender && document.sender_username && (
              <span className="flex items-center gap-1">
                <HiOutlineUser className="w-3 h-3" />
                {document.sender_username}
              </span>
            )}
            {!showSender && document.receiver_username && (
              <span className="flex items-center gap-1">
                <HiOutlineUser className="w-3 h-3" />
                To: {document.receiver_username}
              </span>
            )}
            <span className="flex items-center gap-1">
              <HiOutlineClock className="w-3 h-3" />
              {formatDate(document.created_at)}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`badge ${getStatusColor(document.status)}`}>
          {statusLabel[document.status] || document.status}
        </span>
      </div>
    </motion.div>
  );
}
