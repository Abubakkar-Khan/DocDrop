/**
 * LoginPage — High-Doodly Production version
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { RoughBox, RoughButton } from "../components/Rough/RoughComponents";
import RoughWrapper from "../components/Rough/RoughWrapper";
import DoodleIcon from "../components/Rough/DoodleIcon";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, password);
        setSuccess("Account created. RSA keypair generated.");
      } else {
        await login(username, password);
      }
      setTimeout(() => navigate("/dashboard/upload"), 500);
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.response?.data?.error || err.message || "Connection to secure node lost. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-8 relative overflow-hidden">
      {/* Background Doodles */}
      <div className="parallax-bg inset-0 opacity-10">
        <DoodleIcon name="shield" size={300} className="absolute top-20 left-20 -rotate-12" />
        <DoodleIcon name="lock" size={300} className="absolute bottom-20 right-20 rotate-12" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: error ? [-5, 5, -5, 5, 0] : 0 
        }}
        transition={{ 
          opacity: { duration: 0.5 },
          y: { duration: 0.5 },
          x: { duration: 0.4 }
        }}
        className="w-full max-w-xl"
      >
        <RoughBox className="bg-white" options={{ roughness: 1.5 }}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-accent/5 rounded-full mb-6">
              <DoodleIcon name="shield" size={60} color="#0066FF" />
            </div>
            <h1 className="text-5xl font-doodle mb-2">DocDrop</h1>
            <p className="text-xs uppercase tracking-[0.3em] opacity-40 font-sans font-bold">
              Secure Digital Signatures
            </p>
          </div>

          <div className="flex mb-12 border-b border-dashed border-primary/10">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-4 font-hand text-2xl transition-all ${!isRegister ? "text-accent border-b-4 border-accent" : "opacity-30 hover:opacity-100"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-4 font-hand text-2xl transition-all ${isRegister ? "text-accent border-b-4 border-accent" : "opacity-30 hover:opacity-100"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold opacity-50 ml-1">Username</label>
              <div className="relative">
                <RoughWrapper options={{ roughness: 0.8 }}>
                  <div className="flex items-center">
                    <DoodleIcon name="user" size={24} className="ml-4 opacity-30" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                      className="w-full h-16 bg-transparent px-4 font-hand text-2xl outline-none placeholder:opacity-20"
                    />
                  </div>
                </RoughWrapper>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold opacity-50 ml-1">Password</label>
              <div className="relative">
                <RoughWrapper options={{ roughness: 0.8 }}>
                  <div className="flex items-center">
                    <DoodleIcon name="lock" size={24} className="ml-4 opacity-30" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full h-16 bg-transparent px-4 font-hand text-2xl outline-none placeholder:opacity-20"
                    />
                  </div>
                </RoughWrapper>
              </div>
            </div>

            <AnimatePresence>
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`font-hand text-xl text-center px-4 py-2 border border-dashed rounded ${error ? "text-error bg-error/5 border-error/20" : "text-success bg-success/5 border-success/20"}`}
                >
                  {error || success}
                </motion.div>
              )}
            </AnimatePresence>

            <RoughButton
              onClick={handleSubmit}
              className="w-full h-20"
              color={isRegister ? "#F0F9FF" : "#FAFAFA"}
            >
              <div className="flex items-center justify-center gap-3">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <DoodleIcon name="check" size={24} />
                    <span>{isRegister ? "Create Account" : "Access System"}</span>
                  </>
                )}
              </div>
            </RoughButton>
          </form>
        </RoughBox>
        
        <p className="text-center text-[10px] uppercase tracking-widest opacity-30 mt-12 font-sans font-bold">
          RSA-2048 Asymmetric Cryptography · SHA-256 Hashing
        </p>
      </motion.div>
    </div>
  );
}
