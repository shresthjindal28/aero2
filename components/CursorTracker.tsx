"use client";

import React, { useState, useEffect } from 'react';

const CursorTracker: React.FC = () => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const cursorStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '22px',
    height: '22px',
    background: 'radial-gradient(circle at 30% 30%, rgba(173,216,230,0.55), rgba(173,216,230,0.25))',
    borderRadius: '50%',
    border: '1px solid rgba(173,216,230,0.7)',
    boxShadow: '0 10px 25px rgba(173,216,230,0.35), 0 0 0 8px rgba(173,216,230,0.15)',
    pointerEvents: 'none',
    zIndex: 9999,
    transform: `translate3d(${position.x}px, ${position.y}px, 0) translate3d(-50%, -50%, 0)`,
    transition: 'transform 0.07s ease-out',
    backdropFilter: 'blur(1px)',
    willChange: 'transform',
  };

  return <div aria-hidden="true" style={cursorStyle} />;
};

export default CursorTracker;