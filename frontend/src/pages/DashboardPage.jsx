/**
 * DashboardPage — Production Doodly version (Final)
 */
import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { motion, useScroll, useTransform } from "framer-motion";
import DoodleIcon from "../components/Rough/DoodleIcon";

export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const { scrollY } = useScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen bg-surface overflow-hidden relative flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-primary/10 z-50">
        <div className="flex items-center gap-2">
          <DoodleIcon name="shield" size={24} color="#0052FF" />
          <h1 className="text-2xl font-doodle">DocDrop</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 border-2 border-primary rounded-lg active:scale-95 transition-transform"
        >
          <DoodleIcon name={isMobileMenuOpen ? "close" : "menu"} size={24} />
        </button>
      </div>

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

      {/* Sidebar - Desktop & Mobile Overlay */}
      <div className={`
        fixed inset-0 z-40 md:relative md:flex transition-transform duration-300
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div 
          className="absolute inset-0 bg-primary/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="relative w-80 max-w-[85vw] h-full">
          <Sidebar onNavClick={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>
      
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-thin p-4 md:p-12 lg:p-20">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
