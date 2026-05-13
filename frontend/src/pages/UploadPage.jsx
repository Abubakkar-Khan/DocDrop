/**
 * UploadPage — High-Doodly Production version
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { documentsAPI, authAPI } from "../api/client";
import { RoughBox, RoughButton } from "../components/Rough/RoughComponents";
import RoughWrapper from "../components/Rough/RoughWrapper";
import DoodleIcon from "../components/Rough/DoodleIcon";

export default function UploadPage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [document, setDocument] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [step, setStep] = useState("upload"); // upload | preview | signed | done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data.users);
    } catch { /* Ignore */ }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".docx")) {
      setFile(selected);
      uploadFile(selected);
    } else if (selected) {
      setError("File validation error: Please upload a .docx file.");
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
      setError(err.response?.data?.error || "Document upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!document) return;
    setIsSigning(true);
    setError("");
    
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      const res = await documentsAPI.sign(document.id);
      setDocument(res.data.document);
      setStep("signed");
    } catch (err) {
      setError(err.response?.data?.error || "Cryptographic signing failed.");
    } finally {
      setIsSigning(false);
    }
  };

  const handleSend = async () => {
    if (!document || !selectedReceiver) return;
    setLoading(true);
    setError("");
    try {
      await documentsAPI.send(document.id, selectedReceiver);
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.error || "Document transmission failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setDocument(null);
    setSelectedReceiver("");
    setStep("upload");
    setError("");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="border-b-2 border-dashed border-primary/10 pb-8 mb-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-6xl font-hand tracking-tight leading-none mb-2">
              {step === "upload" && "Upload Document"}
              {step === "preview" && "Preview Content"}
              {step === "signed" && "Review Signature"}
              {step === "done" && "Protocol Complete"}
            </h1>
            <p className="font-sans text-[10px] uppercase tracking-widest opacity-40 font-bold">Step {step === "upload" ? "1" : step === "preview" ? "2" : step === "signed" ? "3" : "4"} of 4 · Cryptographic Workflow</p>
          </div>
          {step !== "upload" && (
             <button onClick={reset} className="btn-doodle text-sm opacity-50 hover:opacity-100 flex items-center gap-1">
              <DoodleIcon name="logout" size={16} /> Reset Process
            </button>
          )}
        </div>
      </header>

      {error && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-error/5 border border-error/20 p-6 rounded-lg mb-8 flex items-center gap-4">
          <DoodleIcon name="zap" size={32} color="#FF3300" />
          <div>
            <p className="text-[10px] uppercase font-bold text-error opacity-60">System Alert</p>
            <p className="font-hand text-xl text-error">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 flex-1">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full"
              >
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-full cursor-pointer group"
                >
                  <RoughBox className="h-full bg-white flex flex-col items-center justify-center p-8 md:p-20 hover:bg-surface-dim transition-colors" options={{ roughness: 1.5 }}>
                    <input ref={fileInputRef} type="file" accept=".docx" onChange={handleFileSelect} className="hidden" />
                    <DoodleIcon name="upload" size={120} color="#222222" className="mb-6 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    <h2 className="text-3xl font-hand">Select Document to Sign</h2>
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-30 mt-4 font-bold">Accepted Formats: .DOCX (Microsoft Word)</p>
                  </RoughBox>
                </div>
              </motion.div>
            )}

            {step === "preview" && document && (
              <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <RoughBox className="bg-white" options={{ roughness: 0.8 }}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <DoodleIcon name="file" size={48} color="#0066FF" />
                      <div>
                        <p className="text-[10px] uppercase font-bold opacity-30">Document Identified</p>
                        <h2 className="text-2xl font-hand">{document.original_filename}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-dim p-8 border border-primary/5 overflow-auto max-h-96 rounded">
                    <p className="text-[10px] uppercase font-bold opacity-30 mb-4 tracking-widest">Extracted Payload Content</p>
                    <pre className="text-lg font-hand leading-relaxed whitespace-pre-wrap">{document.text_content}</pre>
                  </div>
                </RoughBox>

                <RoughButton 
                  onClick={handleSign} 
                  disabled={isSigning}
                  className="w-full h-24"
                  color="#FAFAFA"
                >
                  <div className="flex items-center justify-center gap-3">
                    <DoodleIcon name="key" size={32} />
                    <span className="text-2xl">{isSigning ? "Processing Cipher..." : "Authorize Signature"}</span>
                  </div>
                </RoughButton>

                <AnimatePresence>
                  {isSigning && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] bg-surface/40 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-20"
                    >
                      <RoughBox className="bg-white p-6 md:p-12 text-center w-full max-w-2xl shadow-2xl" options={{ roughness: 2.5, strokeWidth: 3 }}>
                        <h2 className="text-3xl md:text-4xl font-hand mb-8">Executing RSA-2048 Protocol</h2>
                        <div className="space-y-10">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] uppercase font-bold opacity-40">
                              <span>Hashing Payload</span>
                              <span>SHA-256</span>
                            </div>
                            <div className="h-4 bg-surface-dim w-full rounded-none border-2 border-primary/20 p-1">
                              <motion.div 
                                className="h-full bg-accent" 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.8 }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between text-[10px] uppercase font-bold opacity-40">
                              <span>Generating Seal</span>
                              <span>RSA Private Key</span>
                            </div>
                            <div className="h-4 bg-surface-dim w-full rounded-none border-2 border-primary/20 p-1">
                              <motion.div 
                                className="h-full bg-primary" 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.8, duration: 1.2 }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="font-hand text-2xl mt-12 opacity-60 animate-pulse">Calculating message digest and authenticating integrity...</p>
                      </RoughBox>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {step === "signed" && document && (
              <motion.div key="signed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <RoughBox className="bg-white text-center p-16" options={{ roughness: 1.5, fill: "#F0FFF4", fillStyle: "zigzag" }}>
                  <DoodleIcon name="shield" size={100} color="#22AA22" className="mx-auto mb-6" />
                  <h2 className="text-5xl font-hand text-success">Signature Verified</h2>
                  <p className="text-[10px] uppercase font-bold opacity-30 mt-4 tracking-[0.2em]">Authenticity Token Successfully Integrated</p>
                </RoughBox>

                <RoughBox className="bg-white p-12" options={{ roughness: 1.2 }}>
                  <h3 className="text-[10px] uppercase font-bold opacity-30 mb-8 tracking-widest">Select Destination Node</h3>
                  <div className="flex flex-col gap-8">
                    <select
                      value={selectedReceiver}
                      onChange={(e) => setSelectedReceiver(e.target.value)}
                      className="w-full h-16 border border-dashed border-primary/20 bg-transparent px-6 font-hand text-2xl focus:outline-none focus:border-accent"
                    >
                      <option value="">-- Choose Receiver --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.username}</option>
                      ))}
                    </select>
                    <RoughButton 
                      onClick={handleSend} 
                      disabled={!selectedReceiver || loading}
                      className="h-24"
                      color="#F0F9FF"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <DoodleIcon name="send" size={32} />
                        <span className="text-2xl">Transmit Document</span>
                      </div>
                    </RoughButton>
                  </div>
                </RoughBox>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
                <RoughBox className="h-full bg-white flex flex-col items-center justify-center text-center p-12 md:p-20" options={{ roughness: 2, fill: "#F0F9FF" }}>
                  <DoodleIcon name="check" size={100} mdSize={150} color="#0066FF" className="mb-8" />
                  <h2 className="text-4xl md:text-6xl font-hand mb-6">Process Complete</h2>
                  <p className="text-[10px] uppercase font-bold opacity-30 tracking-[0.3em]">Document Hash: {document.hash?.slice(0, 32)}...</p>
                  
                  <RoughButton onClick={reset} className="mt-16 px-12 h-20" color="#FAFAFA">
                    New Document Request
                  </RoughButton>
                </RoughBox>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Context */}
        <div className="lg:col-span-4 space-y-12">
          <RoughBox className="bg-surface-dim" options={{ roughness: 1.2 }}>
            <h3 className="text-[10px] uppercase font-bold opacity-30 mb-6 tracking-widest">System Guidelines</h3>
            <p className="font-hand text-xl leading-relaxed opacity-60">
              {step === "upload" && "Choose a document from your local storage to begin the secure signing process."}
              {step === "preview" && "Verify the extracted content below. The SHA-256 hash will be generated from this exact text payload."}
              {step === "signed" && "The document has been securely sealed. Choose a verified user node for final transmission."}
              {step === "done" && "Transaction recorded. The document integrity is now verifiable by the recipient node."}
            </p>
          </RoughBox>

          <div className="p-8 border-l-2 border-dashed border-accent/20">
            <p className="text-[10px] uppercase font-bold text-accent opacity-60 mb-6 tracking-widest">Workflow Progress</p>
            <div className="space-y-6">
              {["Upload", "Sign", "Send"].map((s, i) => (
                <div key={s} className="flex items-center gap-4">
                  <div className={`w-5 h-5 border rounded-sm transition-all ${step === s.toLowerCase() || (step === "preview" && s === "Upload") || (step === "signed" && (s === "Upload" || s === "Sign")) || step === "done" ? "bg-accent border-accent" : "border-primary/20"}`} />
                  <span className={`text-xl font-hand ${step === s.toLowerCase() ? "text-accent" : "opacity-30"}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
