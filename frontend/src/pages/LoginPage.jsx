/**
 * LoginPage — Authentication with Swiss minimalist design
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineKey,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineFingerPrint,
} from "react-icons/hi2";

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
        setSuccess("Account created! RSA-2048 keypair generated.");
      } else {
        await login(username, password);
      }
      setTimeout(() => navigate("/dashboard/upload"), 300);
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/20"
          >
            <HiOutlineShieldCheck className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-text tracking-tight">
            DocDrop
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Secure Document Signing & Verification
          </p>
        </div>

        {/* Auth Card */}
        <div className="card p-8">
          {/* Tab Toggle */}
          <div className="flex bg-surface-alt rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isRegister
                  ? "bg-surface-card text-text shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isRegister
                  ? "bg-surface-card text-text shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  minLength={3}
                  className="input-field pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  minLength={4}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-error-50 text-error text-sm px-4 py-2.5 rounded-lg border border-error/10"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-success-50 text-success text-sm px-4 py-2.5 rounded-lg border border-success/10"
                >
                  <div className="flex items-center gap-2">
                    <HiOutlineKey className="w-4 h-4" />
                    {success}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-75"
                    />
                  </svg>
                  {isRegister ? "Generating RSA Keys..." : "Authenticating..."}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <HiOutlineFingerPrint className="w-4 h-4" />
                  {isRegister ? "Create Account" : "Sign In"}
                </span>
              )}
            </button>
          </form>

          {/* Info Note for Register */}
          {isRegister && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-start gap-2 text-xs text-text-muted bg-primary-50 px-3 py-2.5 rounded-lg"
            >
              <HiOutlineKey className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>
                Upon registration, an <strong>RSA-2048 keypair</strong> will be
                automatically generated for you. Your public key will be shared
                with the system for signature verification.
              </span>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-light mt-6">
          Educational Digital Signature System · RSA-2048 + SHA-256
        </p>
      </motion.div>
    </div>
  );
}
