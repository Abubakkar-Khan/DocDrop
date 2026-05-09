/**
 * StepControls — Navigation controls for the step-by-step visualization
 */
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlinePlayCircle, HiOutlinePauseCircle } from "react-icons/hi2";

export default function StepControls({ currentStep, totalSteps, onPrev, onNext, autoPlay, onToggleAutoPlay }) {
  return (
    <div className="flex items-center justify-between bg-surface-alt rounded-xl px-4 py-3">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === currentStep
                ? "bg-primary w-6 rounded-full"
                : i < currentStep
                ? "bg-primary/40"
                : "bg-border"
            }`}
          />
        ))}
        <span className="text-xs text-text-muted ml-2">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className="p-2 rounded-lg hover:bg-surface-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous Step"
        >
          <HiOutlineChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <button
          onClick={onToggleAutoPlay}
          className="p-2 rounded-lg hover:bg-surface-card transition-colors"
          title={autoPlay ? "Pause" : "Auto Play"}
        >
          {autoPlay ? (
            <HiOutlinePauseCircle className="w-5 h-5 text-primary" />
          ) : (
            <HiOutlinePlayCircle className="w-5 h-5 text-text-secondary" />
          )}
        </button>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          className="p-2 rounded-lg hover:bg-surface-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next Step"
        >
          <HiOutlineChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </div>
  );
}
