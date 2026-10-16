"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Skiper104 - Staggered Scroll Reveal Grid Card
 * Delivers faster, ultra-smooth scroll entrance transitions tuned to Lenis.
 */
export function Skiper104ScrollCard({
  children,
  index = 0,
  className = "",
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: Math.min((index % 4) * 0.08, 0.32),
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn("will-change-transform", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default Skiper104ScrollCard;
