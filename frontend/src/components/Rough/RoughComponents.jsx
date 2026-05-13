import React from 'react';
import RoughWrapper from './RoughWrapper';

export const RoughButton = ({ children, onClick, className = "", color = "transparent" }) => (
  <button onClick={onClick} className={`group relative ${className}`}>
    <RoughWrapper 
      options={{ fill: color, fillStyle: 'zigzag', hachureAngle: 60 }}
      className="px-6 py-2"
    >
      <span className="font-hand text-xl group-hover:text-accent transition-colors">
        {children}
      </span>
    </RoughWrapper>
  </button>
);

export const RoughBox = ({ children, className = "", options = {} }) => (
  <RoughWrapper options={options} className={`p-8 ${className}`}>
    {children}
  </RoughWrapper>
);
