"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PrizeCarousel = () => {
  const prizes = [
    { room: "MESA #A102", amount: "450.000 Kz" },
    { room: "MESA #B205", amount: "1.200.000 Kz" },
    { room: "MESA #C098", amount: "85.000 Kz" },
    { room: "MESA #D441", amount: "2.500.000 Kz" },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % prizes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-12 overflow-hidden relative flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="flex flex-col items-start"
        >
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Prêmio {prizes[index].room}
          </span>
          <span className="text-xl font-black text-green-400">
            {prizes[index].amount}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PrizeCarousel;