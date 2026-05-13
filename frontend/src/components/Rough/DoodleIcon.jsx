import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';

export default function DoodleIcon({ name, size = 24, color = '#222222', className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    try {
      const rc = rough.canvas(canvas);
      ctx.clearRect(0, 0, size, size);

    const options = {
      stroke: color,
      strokeWidth: 1.5,
      roughness: 2.0,
      bowing: 2.0,
    };

    const s = size;
    const p = s * 0.1; // padding

    switch (name) {
      case 'file':
        rc.path(`M ${p} ${p} L ${s - p * 3} ${p} L ${s - p} ${p * 3} L ${s - p} ${s - p} L ${p} ${s - p} Z`, options);
        rc.line(s - p * 3, p, s - p * 3, p * 3, options);
        rc.line(s - p * 3, p * 3, s - p, p * 3, options);
        break;
      case 'lock':
        rc.rectangle(p, s * 0.4, s - p * 2, s * 0.5 - p, options);
        rc.arc(s / 2, s * 0.4, s * 0.4, s * 0.4, Math.PI, 0, false, options);
        break;
      case 'key':
        rc.circle(p * 3, s / 2, p * 2, options);
        rc.line(p * 5, s / 2, s - p, s / 2, options);
        rc.line(s - p, s / 2, s - p, s / 2 + p * 2, options);
        rc.line(s - p * 2.5, s / 2, s - p * 2.5, s / 2 + p * 2, options);
        break;
      case 'shield':
        rc.path(`M ${s / 2} ${p} L ${s - p} ${p * 2} L ${s - p} ${s / 2} C ${s - p} ${s - p} ${s / 2} ${s} ${s / 2} ${s} C ${s / 2} ${s} ${p} ${s - p} ${p} ${s / 2} L ${p} ${p * 2} Z`, options);
        break;
      case 'send':
        rc.path(`M ${p} ${s / 2} L ${s - p} ${p} L ${s * 0.6} ${s / 2} L ${s - p} ${s - p} Z`, options);
        rc.line(p, s / 2, s * 0.6, s / 2, options);
        break;
      case 'inbox':
        rc.path(`M ${p} ${p * 3} L ${s - p} ${p * 3} L ${s - p} ${s - p} L ${p} ${s - p} Z`, options);
        rc.path(`M ${p} ${s * 0.6} L ${s * 0.3} ${s * 0.6} L ${s * 0.4} ${s * 0.7} L ${s * 0.6} ${s * 0.7} L ${s * 0.7} ${s * 0.6} L ${s - p} ${s * 0.6}`, options);
        break;
      case 'user':
        rc.circle(s / 2, s * 0.3, s * 0.2, options);
        rc.arc(s / 2, s, s * 0.8, s * 0.8, Math.PI, 0, false, options);
        break;
      case 'check':
        rc.path(`M ${p} ${s / 2} L ${s / 2} ${s - p} L ${s - p} ${p}`, options);
        break;
      case 'upload':
        rc.path(`M ${p} ${s - p * 3} L ${p} ${s - p} L ${s - p} ${s - p} L ${s - p} ${s - p * 3}`, options);
        rc.line(s / 2, s - p * 2, s / 2, p, options);
        rc.path(`M ${s / 2 - p * 2} ${p + p * 2} L ${s / 2} ${p} L ${s / 2 + p * 2} ${p + p * 2}`, options);
        break;
      case 'zap':
        rc.path(`M ${s * 0.6} ${p} L ${p * 2} ${s * 0.6} L ${s * 0.5} ${s * 0.6} L ${s * 0.4} ${s - p} L ${s - p * 2} ${s * 0.4} L ${s / 2} ${s * 0.4} Z`, options);
        break;
      case 'logout':
        rc.path(`M ${s / 2} ${p} L ${p} ${p} L ${p} ${s - p} L ${s / 2} ${s - p}`, options);
        rc.line(s * 0.3, s / 2, s - p, s / 2, options);
        rc.path(`M ${s - p * 3} ${s / 2 - p * 2} L ${s - p} ${s / 2} L ${s - p * 3} ${s / 2 + p * 2}`, options);
        break;
      default:
        rc.rectangle(p, p, s - p * 2, s - p * 2, options);
    }
    } catch (err) {
      console.error("DoodleIcon render error:", err);
    }
  }, [name, size, color]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`inline-block ${className}`}
    />
  );
}
