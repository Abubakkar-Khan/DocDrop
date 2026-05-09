/**
 * InboxPage — Received documents with verification flow
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { documentsAPI, cryptoAPI } from "../api/client";
import DocumentCard from "../components/DocumentCard";
import StepVisualizer from "../components/StepVisualizer";
import { HiOutlineInbox, HiOutlineShieldCheck, HiOutlineArrowLeft, HiOutlineExclamationTriangle, HiOutlineDocumentArrowDown, HiOutlineBugAnt } from "react-icons/hi2";

export default function InboxPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showViz, setShowViz] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadInbox(); }, []);

  const loadInbox = async () => {
    try { const res = await documentsAPI.getInbox(); setDocuments(res.data.documents); }
    catch { setError("Failed to load inbox"); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!selectedDoc) return;
    setVerifying(true); setError("");
    try {
      const res = await cryptoAPI.verify(selectedDoc.id);
      setVerificationResult(res.data);
      loadInbox();
    } catch (err) { setError(err.response?.data?.error || "Verification failed"); }
    finally { setVerifying(false); }
  };

  const handleTamper = async () => {
    if (!selectedDoc) return;
    try {
      await documentsAPI.tamper(selectedDoc.id);
      const res = await documentsAPI.getDocument(selectedDoc.id);
      setSelectedDoc(res.data.document);
      setVerificationResult(null); setShowViz(false); setError("");
    } catch (err) { setError(err.response?.data?.error || "Tamper failed"); }
  };

  const handleDownload = async () => {
    if (!selectedDoc) return;
    try {
      const res = await documentsAPI.download(selectedDoc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = window.document.createElement("a");
      a.href = url; a.download = selectedDoc.original_filename; a.click();
      window.URL.revokeObjectURL(url);
    } catch { setError("Download failed"); }
  };

  const goBack = () => { setSelectedDoc(null); setVerificationResult(null); setShowViz(false); setError(""); };

  if (loading) return <div className="animate-fade-in flex items-center justify-center py-20"><p className="text-text-muted text-sm">Loading inbox...</p></div>;

  // Detail view
  if (selectedDoc) {
    return (
      <div className="animate-fade-in">
        <button onClick={goBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-text mb-6 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Inbox
        </button>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <HiOutlineInbox className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text">{selectedDoc.original_filename}</h2>
                <p className="text-xs text-text-muted">From: {selectedDoc.sender_username}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDownload} className="btn-secondary text-xs"><HiOutlineDocumentArrowDown className="w-4 h-4" /> Download</button>
              <button onClick={handleTamper} className="btn-danger text-xs" title="Tamper for demo"><HiOutlineBugAnt className="w-4 h-4" /> Tamper</button>
            </div>
          </div>
          <div className="bg-surface-alt rounded-lg p-4 max-h-48 overflow-y-auto">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">Document Content</p>
            <p className="text-sm text-text-secondary whitespace-pre-wrap font-mono leading-relaxed">{selectedDoc.text_content}</p>
          </div>
        </div>

        <AnimatePresence>
          {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-error-50 text-error text-sm px-4 py-3 rounded-lg border border-error/10 mb-6">{error}</motion.div>}
        </AnimatePresence>

        {!verificationResult && (
          <button onClick={handleVerify} disabled={verifying} className="btn-primary w-full py-3 mb-6">
            <HiOutlineShieldCheck className="w-5 h-5" />
            {verifying ? "Verifying Signature..." : "Verify Digital Signature"}
          </button>
        )}

        {verificationResult && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className={`card p-6 ${verificationResult.result === "verified" ? "border-success/20 bg-success-50/30" : "border-error/20 bg-error-50/30"}`}>
              <div className="flex items-center gap-3">
                {verificationResult.result === "verified"
                  ? <HiOutlineShieldCheck className="w-8 h-8 text-success" />
                  : <HiOutlineExclamationTriangle className="w-8 h-8 text-error" />}
                <div>
                  <h3 className="text-lg font-bold text-text">
                    {verificationResult.result === "verified" ? "✓ Signature Verified" : "✗ Verification Failed — Document Tampered!"}
                  </h3>
                  <p className="text-sm text-text-muted mt-0.5">
                    {verificationResult.result === "verified"
                      ? "The document is authentic and has not been modified since signing."
                      : "The document content has been modified after signing."}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Verification Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-alt rounded-lg p-3">
                  <span className="text-xs text-text-light block mb-1">Hash Match</span>
                  <span className={`text-sm font-semibold ${verificationResult.steps.hashes_match ? "text-success" : "text-error"}`}>
                    {verificationResult.steps.hashes_match ? "✓ Match" : "✗ Mismatch"}
                  </span>
                </div>
                <div className="bg-surface-alt rounded-lg p-3">
                  <span className="text-xs text-text-light block mb-1">Signature Valid</span>
                  <span className={`text-sm font-semibold ${verificationResult.steps.signature_valid ? "text-success" : "text-error"}`}>
                    {verificationResult.steps.signature_valid ? "✓ Valid" : "✗ Invalid"}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={() => setShowViz(!showViz)} className="btn-secondary w-full">
              {showViz ? "Hide Visualization" : "🔬 View Verification Process Step-by-Step"}
            </button>

            {showViz && <StepVisualizer mode="verification" data={verificationResult.steps} />}

            <button onClick={() => { setVerificationResult(null); setShowViz(false); }} className="btn-secondary w-full">
              Run Verification Again
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text tracking-tight">Inbox</h1>
        <p className="text-sm text-text-muted mt-1">Documents received from other users</p>
      </div>
      {documents.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center mx-auto mb-4">
            <HiOutlineInbox className="w-7 h-7 text-text-light" />
          </div>
          <h3 className="text-sm font-medium text-text">No documents yet</h3>
          <p className="text-xs text-text-muted mt-1">Documents sent to you will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => <DocumentCard key={doc.id} document={doc} onClick={() => setSelectedDoc(doc)} showSender={true} />)}
        </div>
      )}
    </div>
  );
}
