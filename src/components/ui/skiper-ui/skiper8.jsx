"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = [
  "शुभ दीपावली",
  "LoveKod Atelier",
  "Festive Kurtha",
  "Tihar Edit",
  "लभकोण",
];

export function Skiper8Preloader({ onComplete, duration = 2400 }) {
  const [index, setIndex] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    // Only cycle a few words then complete
    const intervalTime = Math.floor(duration / (WORDS.length + 1));
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= WORDS.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setComplete(true);
            if (onComplete) onComplete();
          }, 350);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {!complete && (
        <motion.div
          key="skiper8-preloader"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%", transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--night)] text-[var(--paper)] select-none pointer-events-auto"
          aria-label="Loading LoveKod festive store"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
            <div className="h-8 overflow-hidden flex items-center justify-center min-w-[220px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={index}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -24, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="font-serif text-xl sm:text-2xl tracking-wide text-center"
                >
                  {WORDS[index]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <div className="absolute bottom-8 text-xs tracking-widest uppercase opacity-40 font-mono">
            Handcrafted in Nepal
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Skiper8Preloader;
