"use client";

import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
  initialSeconds: number;
}

const CountdownTimer = ({ initialSeconds }: CountdownTimerProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = seconds < 60;
  const isCritical = seconds < 10;

  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors duration-300 ${
      isCritical ? 'text-red-500 animate-pulse' : 
      isUrgent ? 'text-amber-500' : 'text-blue-400'
    }`}>
      <Timer size={14} className={isCritical ? 'animate-spin-slow' : ''} />
      <AnimatePresence mode="wait">
        <motion.span
          key={seconds}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {formatTime(seconds)}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default CountdownTimer;