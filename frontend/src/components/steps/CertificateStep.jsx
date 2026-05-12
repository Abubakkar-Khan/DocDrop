/**
 * CertificateStep — Visualizes the X.509 certificate extraction
 */
import { motion } from "framer-motion";
import { HiOutlineIdentification, HiOutlineKey, HiOutlineCheckBadge } from "react-icons/hi2";

export default function CertificateStep({ data }) {
  const { sender_certificate, sender_username, sender_public_key } = data;

  if (!sender_certificate) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-text-muted">No certificate found. Falling back to public key verification.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <HiOutlineIdentification className="w-6 h-6 text-primary" />
          <h4 className="text-sm font-semibold text-text">Sender's Identity Certificate</h4>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Issued to:</span>
            <span className="font-mono text-primary font-bold">{sender_username}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Organization:</span>
            <span className="text-text-secondary">DocDrop Educational</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Type:</span>
            <span className="text-text-secondary">X.509 (Self-Signed)</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-text-light/20"></div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Extraction Process</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-surface-alt rounded-lg p-4 border border-text-light/5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-success-50 rounded-lg">
              <HiOutlineKey className="w-4 h-4 text-success" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-text mb-1">Extracted Public Key</p>
              <div className="bg-black/5 rounded p-2 overflow-x-auto">
                <code className="text-[10px] text-text-secondary whitespace-nowrap">
                  {sender_public_key.substring(0, 60)}...
                </code>
              </div>
              <p className="text-[10px] text-text-muted mt-2">
                Verification uses the public key found inside this verified certificate.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-success bg-success-50/50 p-2 rounded-lg border border-success/10 justify-center">
        <HiOutlineCheckBadge className="w-4 h-4" />
        <span>Certificate format validated successfully</span>
      </div>
    </div>
  );
}
