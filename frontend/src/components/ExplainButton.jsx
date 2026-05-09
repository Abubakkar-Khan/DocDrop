/**
 * ExplainButton — Educational modal for each crypto step
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineAcademicCap, HiOutlineXMark } from "react-icons/hi2";

const explanations = {
  hashing: {
    title: "What is Hashing?",
    content: `SHA-256 (Secure Hash Algorithm 256-bit) converts any input text into a fixed-length 64-character hexadecimal string.

Key Properties:
• Deterministic — Same input always produces same output
• One-Way — Cannot reverse the hash to get original text
• Avalanche Effect — Tiny change in input creates completely different hash
• Fixed Length — Output is always 256 bits (64 hex characters)

In digital signatures, we hash the document first because RSA can only encrypt small amounts of data. The hash acts as a unique "fingerprint" of the document.`,
  },
  signing: {
    title: "What is RSA Signing?",
    content: `RSA-PSS (Probabilistic Signature Scheme) uses the sender's PRIVATE KEY to encrypt the document hash, creating a digital signature.

How it works:
1. The hash (64 hex chars) is encrypted with the sender's private key
2. Only the sender's private key can create this specific signature
3. Anyone with the sender's public key can decrypt it

This proves AUTHENTICITY — only the person with the private key could have created this signature. It's like a handwritten signature, but mathematically verifiable.

RSA-2048 means we use 2048-bit keys, which is the current security standard.`,
  },
  transmission: {
    title: "What is Transmitted?",
    content: `When a signed document is sent, the receiver gets:

1. The original document (the .docx file)
2. The digital signature (encrypted hash)
3. The sender's identity (to look up their public key)

The PRIVATE KEY is never transmitted! Only the public key is shared.

This is secure because:
• Even if intercepted, the signature can't be forged without the private key
• Any modification to the document will be detected during verification
• The public key only verifies — it cannot create signatures`,
  },
  verification: {
    title: "How Does Verification Work?",
    content: `Verification is a two-step comparison process:

Step 1: Recompute the hash
• Take the received document's content
• Run SHA-256 on it to get a new hash
• This tells us what the document CURRENTLY says

Step 2: Decrypt the signature
• Use the SENDER'S PUBLIC KEY to decrypt the signature
• This reveals the hash that was signed originally
• This tells us what the document said WHEN IT WAS SIGNED

Step 3: Compare
• If both hashes match → Document is authentic and unmodified ✓
• If hashes differ → Document was tampered with after signing ✗

This process verifies both INTEGRITY (not modified) and AUTHENTICITY (signed by claimed sender).`,
  },
};

export default function ExplainButton({ step }) {
  const [open, setOpen] = useState(false);
  const info = explanations[step];

  if (!info) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium transition-colors"
      >
        <HiOutlineAcademicCap className="w-4 h-4" />
        Explain This Step
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-surface-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto border border-border"
            >
              <div className="sticky top-0 bg-surface-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <HiOutlineAcademicCap className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-text">{info.title}</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-alt flex items-center justify-center transition-colors"
                >
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                  {info.content}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
