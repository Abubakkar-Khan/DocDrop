/**
 * SentPage — Documents sent by current user
 */
import { useState, useEffect } from "react";
import { documentsAPI } from "../api/client";
import DocumentCard from "../components/DocumentCard";
import { HiOutlinePaperAirplane } from "react-icons/hi2";

export default function SentPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentsAPI.getSent().then(res => {
      setDocuments(res.data.documents);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-fade-in flex items-center justify-center py-20"><p className="text-text-muted text-sm">Loading...</p></div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text tracking-tight">Sent Documents</h1>
        <p className="text-sm text-text-muted mt-1">Documents you have signed and sent</p>
      </div>
      {documents.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center mx-auto mb-4">
            <HiOutlinePaperAirplane className="w-7 h-7 text-text-light" />
          </div>
          <h3 className="text-sm font-medium text-text">No sent documents</h3>
          <p className="text-xs text-text-muted mt-1">Documents you sign and send will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => (
            <DocumentCard key={doc.id} document={doc} showSender={false} />
          ))}
        </div>
      )}
    </div>
  );
}
