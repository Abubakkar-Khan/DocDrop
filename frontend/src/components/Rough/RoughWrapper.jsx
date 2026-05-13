import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';

export default function RoughWrapper({ children, className = "", type = "rectangle", options = {} }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const updateCanvas = () => {
      try {
        const rc = rough.canvas(canvas);
        const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);

      const defaultOptions = {
        stroke: '#222222',
        strokeWidth: 2,
        roughness: 0.8, // More subtle
        bowing: 1.0,    // More controlled
        ...options
      };

      if (width > 10 && height > 10) {
        if (type === "rectangle") {
          rc.rectangle(5, 5, width - 10, height - 10, defaultOptions);
        } else if (type === "circle") {
          rc.circle(width / 2, height / 2, Math.min(width, height) - 10, defaultOptions);
        }
      }
      } catch (err) {
        console.error("RoughWrapper update error:", err);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvas();
    });

    if (container) {
      resizeObserver.observe(container);
    }

    updateCanvas();
    return () => {
      resizeObserver.disconnect();
    };
  }, [type, options]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
