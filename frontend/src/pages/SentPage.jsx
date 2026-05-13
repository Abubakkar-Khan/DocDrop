/**
 * SentPage — High-Doodly Production version
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { documentsAPI } from "../api/client";
import { RoughBox } from "../components/Rough/RoughComponents";
import DoodleIcon from "../components/Rough/DoodleIcon";
import { formatDate } from "../utils/formatters";

export default function SentPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentsAPI.getSent().then(res => {
      setDocuments(res.data.documents);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-t-transparent border-accent rounded-full animate-spin" />
          <p className="font-hand text-2xl text-accent">Accessing Outbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="border-b-2 border-dashed border-primary/10 pb-8 mb-12">
        <h1 className="text-6xl font-hand tracking-tight leading-none">
          Sent Documents
        </h1>
        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-2">Historical Transaction Log</p>
      </header>

      {documents.length === 0 ? (
        <RoughBox className="p-32 text-center" options={{ roughness: 1.5 }}>
          <DoodleIcon name="send" size={100} className="opacity-10" />
          <h2 className="text-3xl font-hand opacity-20">No documents transmitted yet.</h2>
        </RoughBox>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {documents.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <RoughBox 
                className="bg-white group-hover:bg-accent/5 transition-colors" 
                options={{ 
                  roughness: 1.5, 
                  fill: "#FAFAFA",
                  fillStyle: 'zigzag',
                  hachureAngle: 60,
                  hachureGap: 10
                }}
              >
                <div className="flex justify-between mb-8">
                  <span className="font-hand text-xl opacity-20">Log Entry #{idx + 1}</span>
                  <DoodleIcon name="file" size={24} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-3xl font-hand mb-6 truncate group-hover:text-accent transition-colors">{doc.original_filename}</h3>
                
                <div className="space-y-4 mb-8">
                   <div className="flex items-center gap-3 text-[10px] uppercase font-bold opacity-30">
                    <DoodleIcon name="user" size={16} />
                    <span>Recipient ID: {doc.receiver_id?.slice(0, 12)}...</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase font-bold opacity-30">
                    <DoodleIcon name="check" size={16} color="#22AA22" />
                    <span>Sent: {formatDate(doc.created_at)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-primary/10 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-success opacity-60">Verified & Transmitted</span>
                  <div className="w-2 h-2 bg-success rounded-full" />
                </div>
              </RoughBox>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
