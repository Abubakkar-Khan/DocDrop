/**
 * UploadPage — Document upload, signing, and sending flow
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { documentsAPI, authAPI } from "../api/client";
import StepVisualizer from "../components/StepVisualizer";
import {
  HiOutlineCloudArrowUp,
  HiOutlineDocumentText,
  HiOutlineFingerPrint,
  HiOutlinePaperAirplane,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineUser,
} from "react-icons/hi2";

export default function UploadPage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [document, setDocument] = useState(null);
  const [signingDetails, setSigningDetails] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [step, setStep] = useState("upload"); // upload | preview | signed | send | done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVisualization, setShowVisualization] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data.users);
    } catch {
      // Ignore
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith(".docx")) {
      setFile(dropped);
      uploadFile(dropped);
    } else {
      setError("Only .docx files are accepted");
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      uploadFile(selected);
    }
  };

  const uploadFile = async (f) => {
    setLoading(true);
    setError("");
    try {
      const res = await documentsAPI.upload(f);
      setDocument(res.data.document);
      setStep("preview");
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!document) return;
    setLoading(true);
    setError("");
    try {
      const res = await documentsAPI.sign(document.id);
      setDocument(res.data.document);
      setSigningDetails(res.data.signing_details);
      setStep("signed");
    } catch (err) {
      setError(err.response?.data?.error || "Signing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!document || !selectedReceiver) return;
    setLoading(true);
    setError("");
    try {
      const res = await documentsAPI.send(document.id, selectedReceiver);
      setDocument(res.data.document);
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.error || "Send failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setDocument(null);
    setSigningDetails(null);
    setSelectedReceiver("");
    setStep("upload");
    setError("");
    setShowVisualization(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">
            Upload & Sign
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Upload a document, sign it digitally, and send to a receiver
          </p>
        </div>
        {step !== "upload" && (
          <button onClick={reset} className="btn-secondary text-xs">
            <HiOutlineXMark className="w-4 h-4" />
            Start Over
          </button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {["Upload", "Preview", "Sign", "Send"].map((label, i) => {
          const stepNames = ["upload", "preview", "signed", "done"];
          const currentIdx = stepNames.indexOf(step);
          const isActive = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-surface-alt text-text-muted"
                } ${isCurrent ? "ring-4 ring-primary/10" : ""}`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-text" : "text-text-light"
                }`}
              >
                {label}
              </span>
              {i < 3 && (
                <div
                  className={`flex-1 h-0.5 rounded-full transition-colors ${
                    i < currentIdx ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-error-50 text-error text-sm px-4 py-3 rounded-lg border border-error/10 mb-6"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step: Upload */}
      {step === "upload" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`card p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
              dragOver
                ? "border-primary bg-primary-50"
                : "border-border hover:border-primary/40 hover:bg-primary-50/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                dragOver ? "bg-primary/10" : "bg-surface-alt"
              }`}
            >
              <HiOutlineCloudArrowUp
                className={`w-8 h-8 ${
                  dragOver ? "text-primary" : "text-text-muted"
                }`}
              />
            </div>
            <p className="text-sm font-medium text-text">
              {loading ? "Uploading..." : "Drop your .docx file here"}
            </p>
            <p className="text-xs text-text-muted mt-1">
              or click to browse · Max 16MB
            </p>
          </div>
        </motion.div>
      )}

      {/* Step: Preview */}
      {step === "preview" && document && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text">
                  {document.original_filename}
                </h3>
                <p className="text-xs text-text-muted">
                  Uploaded successfully · Ready to sign
                </p>
              </div>
            </div>

            <div className="bg-surface-alt rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
                Extracted Content
              </p>
              <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed font-mono">
                {document.text_content}
              </p>
            </div>
          </div>

          <button
            onClick={handleSign}
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            <HiOutlineFingerPrint className="w-5 h-5" />
            {loading ? "Signing Document..." : "Sign Document (RSA-PSS + SHA-256)"}
          </button>
        </motion.div>
      )}

      {/* Step: Signed */}
      {step === "signed" && document && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Success banner */}
          <div className="card p-6 border-success/20 bg-success-50/30">
            <div className="flex items-center gap-3">
              <HiOutlineCheckCircle className="w-6 h-6 text-success" />
              <div>
                <h3 className="text-sm font-semibold text-text">
                  Document Signed Successfully!
                </h3>
                <p className="text-xs text-text-muted">
                  Digital signature created using your RSA-2048 private key
                </p>
              </div>
            </div>
          </div>

          {/* Signing Details */}
          {signingDetails && (
            <div className="card p-6 space-y-4">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Signing Details
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-text-light block mb-1">
                    Hash Algorithm
                  </span>
                  <code className="text-xs bg-surface-alt px-2 py-1 rounded font-mono">
                    {signingDetails.hash_algorithm}
                  </code>
                </div>
                <div>
                  <span className="text-xs text-text-light block mb-1">
                    Document Hash
                  </span>
                  <code className="text-xs bg-surface-alt px-2 py-1 rounded font-mono break-all block">
                    {signingDetails.hash_value}
                  </code>
                </div>
                <div>
                  <span className="text-xs text-text-light block mb-1">
                    Signature Algorithm
                  </span>
                  <code className="text-xs bg-surface-alt px-2 py-1 rounded font-mono">
                    {signingDetails.signature_algorithm}
                  </code>
                </div>
                <div>
                  <span className="text-xs text-text-light block mb-1">
                    Digital Signature (preview)
                  </span>
                  <code className="text-xs bg-surface-alt px-2 py-1 rounded font-mono break-all block">
                    {signingDetails.signature_preview}
                  </code>
                </div>
              </div>

              {/* Visualization Toggle */}
              <button
                onClick={() => setShowVisualization(!showVisualization)}
                className="btn-secondary w-full mt-4"
              >
                {showVisualization
                  ? "Hide Visualization"
                  : "🔬 View Signing Process Step-by-Step"}
              </button>
            </div>
          )}

          {/* Step-by-step visualization for signing */}
          {showVisualization && signingDetails && (
            <StepVisualizer
              mode="signing"
              data={{
                original_text: document.text_content,
                hash_algorithm: "SHA-256",
                hash_value: signingDetails.hash_value,
                signature: document.signature,
                sender_username: user?.username,
                private_key_preview: signingDetails.private_key_used,
                signature_algorithm: "RSA-PSS (2048-bit)",
              }}
            />
          )}

          {/* Send to Receiver */}
          <div className="card p-6">
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              Send to Receiver
            </h3>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <select
                  id="receiver-select"
                  value={selectedReceiver}
                  onChange={(e) => setSelectedReceiver(e.target.value)}
                  className="input-field pl-10 appearance-none"
                >
                  <option value="">Select receiver...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSend}
                disabled={!selectedReceiver || loading}
                className="btn-primary"
              >
                <HiOutlinePaperAirplane className="w-4 h-4" />
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
            <HiOutlineCheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-text">Document Sent!</h2>
          <p className="text-sm text-text-muted mt-2">
            Your signed document has been delivered to{" "}
            <strong>
              {users.find((u) => u.id === selectedReceiver)?.username}
            </strong>
          </p>
          <p className="text-xs text-text-light mt-1">
            The receiver can now verify the signature in their inbox
          </p>
          <button onClick={reset} className="btn-primary mt-6">
            Sign Another Document
          </button>
        </motion.div>
      )}
    </div>
  );
}
