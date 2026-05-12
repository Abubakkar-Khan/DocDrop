/**
 * StepVisualizer — Step-by-step cryptographic pipeline visualization
 * The KEY educational feature of DocDrop
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepControls from "./StepControls";
import HashingStep from "./steps/HashingStep";
import SigningStep from "./steps/SigningStep";
import TransmissionStep from "./steps/TransmissionStep";
import VerificationStep from "./steps/VerificationStep";
import CertificateStep from "./steps/CertificateStep";

const signingSteps = [
  { key: "hashing", label: "Hashing", Component: HashingStep },
  { key: "signing", label: "Signing", Component: SigningStep },
  { key: "transmission", label: "Transmission", Component: TransmissionStep },
];

const verificationSteps = [
  { key: "hashing", label: "Re-Hashing", Component: HashingStep },
  { key: "certificate", label: "Certificate", Component: CertificateStep },
  { key: "transmission", label: "Transmission", Component: TransmissionStep },
  { key: "verification", label: "Verification", Component: VerificationStep },
];

export default function StepVisualizer({ mode = "verification", data }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const steps = mode === "signing" ? signingSteps : verificationSteps;
  const totalSteps = steps.length;

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay) return;
    if (currentStep >= totalSteps - 1) {
      setAutoPlay(false);
      return;
    }
    const timer = setTimeout(goNext, 3000);
    return () => clearTimeout(timer);
  }, [autoPlay, currentStep, goNext, totalSteps]);

  const { Component } = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text">
            🔬 {mode === "signing" ? "Signing" : "Verification"} Pipeline
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Step-by-step cryptographic visualization
          </p>
        </div>
        <span className="badge bg-primary-50 text-primary">Educational Mode</span>
      </div>

      {/* Step labels */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setCurrentStep(i)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium text-center transition-all duration-200 ${
              i === currentStep
                ? "bg-primary text-white shadow-sm"
                : i < currentStep
                ? "bg-primary/10 text-primary"
                : "bg-surface-alt text-text-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Component data={data} />
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <StepControls
        currentStep={currentStep}
        totalSteps={totalSteps}
        onPrev={goPrev}
        onNext={goNext}
        autoPlay={autoPlay}
        onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
      />
    </motion.div>
  );
}
