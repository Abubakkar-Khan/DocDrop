/**
 * DashboardPage — Production Doodly version (Final)
 */
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { motion, useScroll, useTransform } from "framer-motion";
import DoodleIcon from "../components/Rough/DoodleIcon";

export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const { scrollY } = useScroll();

  // Parallax transforms for background doodles
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -500]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -100]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-6">
          <DoodleIcon name="file" size={80} className="animate-bounce" />
          <p className="font-hand text-3xl">Accessing Secure Node...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden relative">
      {/* Parallax Background Icons */}
      <div className="absolute inset-0 pointer-events-none opacity-10 z-0 overflow-hidden">
        <motion.div style={{ y: y1, rotate }} className="absolute top-[-5%] left-[5%]">
          <DoodleIcon name="key" size={300} color="#0052FF" />
        </motion.div>
        <motion.div style={{ y: y2, rotate: -rotate }} className="absolute top-[20%] right-[-5%]">
          <DoodleIcon name="lock" size={400} color="#1A1A1B" />
        </motion.div>
        <motion.div style={{ y: y3, rotate: rotate }} className="absolute bottom-[10%] left-[15%]">
          <DoodleIcon name="shield" size={280} color="#2E7D32" />
        </motion.div>
        <motion.div style={{ y: y1, rotate: -rotate }} className="absolute bottom-[-10%] right-[10%]">
          <DoodleIcon name="file" size={350} color="#1A1A1B" />
        </motion.div>
      </div>

      <Sidebar />
      
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-thin">
        <div className="max-w-6xl mx-auto p-12 lg:p-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
