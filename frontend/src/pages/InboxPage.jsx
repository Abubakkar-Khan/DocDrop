/**
 * InboxPage — High-Doodly Production version
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { documentsAPI, cryptoAPI } from "../api/client";
import { RoughBox, RoughButton } from "../components/Rough/RoughComponents";
import DoodleIcon from "../components/Rough/DoodleIcon";

export default function InboxPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadInbox(); }, []);

  const loadInbox = async () => {
    try { 
      const res = await documentsAPI.getInbox(); 
      setDocuments(res.data.documents); 
    } catch { 
      setError("Failed to sync inbox data."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleVerify = async () => {
    if (!selectedDoc) return;
    setVerifying(true); 
    setError("");
    
    await new Promise(r => setTimeout(r, 1500));
    
    try {
      const res = await cryptoAPI.verify(selectedDoc.id);
      setVerificationResult(res.data);
      loadInbox();
    } catch (err) { 
      setError(err.response?.data?.error || "Signature verification failed."); 
    } finally { 
      setVerifying(false); 
    }
  };

  const handleTamper = async () => {
    if (!selectedDoc) return;
    try {
      await documentsAPI.tamper(selectedDoc.id);
      const res = await documentsAPI.getDocument(selectedDoc.id);
      setSelectedDoc(res.data.document);
      setVerificationResult(null); 
      setError("");
    } catch (err) { 
      setError("Tamper simulation failed."); 
    }
  };

  const handleDownload = async () => {
    if (!selectedDoc) return;
    try {
      const res = await documentsAPI.download(selectedDoc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = window.document.createElement("a");
      a.href = url; a.download = selectedDoc.original_filename; a.click();
      window.URL.revokeObjectURL(url);
    } catch { 
      setError("Download failed."); 
    }
  };

  const goBack = () => { 
    setSelectedDoc(null); 
    setVerificationResult(null); 
    setError(""); 
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-t-transparent border-accent rounded-full animate-spin" />
          <p className="font-hand text-2xl text-accent">Synchronizing Mailbox...</p>
        </div>
      </div>
    );
  }

  if (selectedDoc) {
    return (
      <div className="flex flex-col min-h-full">
        <header className="border-b-2 border-dashed border-primary/10 pb-8 mb-12">
          <div className="flex justify-between items-end">
            <h1 className="text-4xl md:text-6xl font-hand tracking-tight leading-none">
              Verify Document
            </h1>
            <button onClick={goBack} className="btn-doodle text-sm opacity-50 hover:opacity-100 flex items-center gap-1">
              <DoodleIcon name="logout" size={16} className="rotate-180" /> <span className="hidden md:inline">Return to List</span>
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-5 space-y-8">
            <RoughBox className="bg-white" options={{ roughness: 1 }}>
               <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-30">Originating Node</p>
                  <h2 className="text-2xl font-hand">{selectedDoc.sender_username}</h2>
                </div>
                <DoodleIcon name="inbox" size={40} className="opacity-10" />
              </div>
              <div className="mb-8">
                <p className="text-[10px] uppercase font-bold opacity-30">Document Identifier</p>
                <h3 className="text-xl font-hand">{selectedDoc.original_filename}</h3>
              </div>
              <div className="bg-surface-dim p-6 border border-primary/5 overflow-auto max-h-64 mb-10 rounded">
                <p className="text-[10px] uppercase font-bold opacity-30 mb-2">Internal Payload</p>
                <pre className="text-lg font-hand leading-relaxed whitespace-pre-wrap">{selectedDoc.text_content}</pre>
              </div>
              <div className="flex gap-4">
                <RoughButton onClick={handleDownload} className="flex-1" color="#F0F9FF">
                   Download
                </RoughButton>
                <RoughButton onClick={handleTamper} className="flex-1" color="#FFF5F5">
                  <span className="text-error">Tamper</span>
                </RoughButton>
              </div>
            </RoughBox>
          </div>

          <div className="lg:col-span-7">
            {!verificationResult && (
              <RoughBox className="h-full bg-white flex flex-col items-center justify-center p-12 text-center" options={{ roughness: 1.5 }}>
                <DoodleIcon name="file" size={120} color="#222222" className={`mb-8 ${verifying ? "animate-pulse text-accent" : "opacity-10"}`} />
                <h2 className="text-3xl font-hand">{verifying ? "Auditing Payload..." : "Integrity Check Required"}</h2>
                {!verifying && (
                  <RoughButton onClick={handleVerify} className="mt-12 px-12 h-20" color="#F0FFF4">
                    Run Verification
                  </RoughButton>
                )}
              </RoughBox>
            )}

            {verificationResult && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                <RoughBox 
                  className="p-6 md:p-12 text-center" 
                  options={{ 
                    roughness: 1.5, 
                    fill: verificationResult.result === "verified" ? "#F0FFF4" : "#FFF5F5",
                    fillStyle: "zigzag"
                  }}
                >
                  {verificationResult.result === "verified" 
                    ? <DoodleIcon name="shield" size={80} mdSize={120} color="#22AA22" className="mx-auto mb-8" />
                    : <DoodleIcon name="zap" size={80} mdSize={120} color="#FF3300" className="mx-auto mb-8" />
                  }
                  <h2 className={`text-3xl md:text-5xl font-hand ${verificationResult.result === "verified" ? "text-success" : "text-error"}`}>
                    {verificationResult.result === "verified" ? "Verification Success" : "Integrity Breach"}
                  </h2>
                  <p className="text-[10px] uppercase font-bold opacity-30 mt-4 tracking-[0.2em]">
                    {verificationResult.result === "verified" ? "Document matches original signature node." : "Document payload has been unauthorizedly modified."}
                  </p>
                </RoughBox>

                <RoughBox className="bg-white p-12" options={{ roughness: 0.8 }}>
                  <h3 className="text-[10px] uppercase font-bold opacity-30 mb-8 tracking-widest border-b border-dashed border-primary/10 pb-4">Audit Results</h3>
                  
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-hand">Document hash</p>
                        <p className="text-[10px] uppercase font-bold opacity-30">Hash Consistency Check</p>
                      </div>
                      <span className={`font-hand text-xl px-6 py-2 border-2 rotate-2 transition-all ${verificationResult.steps.hashes_match ? "border-success text-success bg-success/5" : "border-error text-error bg-error/5"}`}>
                        {verificationResult.steps.hashes_match ? "Matched" : "Failed"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-dashed border-primary/20">
                    <RoughButton onClick={() => { setVerificationResult(null); }} className="w-full h-14" color="#FAFAFA">
                      Clear Audit Result
                    </RoughButton>
                  </div>
                </RoughBox>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="border-b-2 border-dashed border-primary/10 pb-4 md:pb-8 mb-8 md:mb-12">
        <h1 className="text-4xl md:text-6xl font-hand tracking-tight leading-none">
          Inbox
        </h1>
        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-2">Received Documents Queue</p>
      </header>

      {documents.length === 0 ? (
        <RoughBox className="p-32 text-center" options={{ roughness: 1.5 }}>
          <DoodleIcon name="inbox" size={100} className="opacity-10" />
          <h2 className="text-3xl font-hand opacity-20">No incoming documents detected.</h2>
        </RoughBox>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {documents.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedDoc(doc)}
              className="group cursor-pointer"
            >
              <RoughBox 
                className="bg-white hover:bg-accent/5 transition-colors" 
                options={{ 
                  roughness: 1.5,
                  fill: idx % 3 === 0 ? "#F0FFF4" : idx % 3 === 1 ? "#F0F9FF" : "#FFF5F5",
                  fillStyle: 'hachure',
                  hachureAngle: 120,
                  hachureGap: 10
                }}
              >
                <div className="flex justify-between mb-8">
                  <span className="font-hand text-xl opacity-20">Item 0{idx + 1}</span>
                  <DoodleIcon name="inbox" size={24} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-3xl font-hand mb-2 truncate group-hover:text-accent transition-colors">{doc.original_filename}</h3>
                <p className="text-[10px] uppercase font-bold opacity-30">Source: {doc.sender_username}</p>
                <div className="mt-10 pt-4 border-t border-dashed border-primary/10 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-accent opacity-60">Verification Ready</span>
                  <DoodleIcon name="check" size={16} color="#0066FF" className="opacity-40" />
                </div>
              </RoughBox>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
