"use client";

import { useReducedMotion } from "framer-motion";

export { useReducedMotion };

// Durations (seconds)
export const DURATION = {
  fast: 0.15,
  normal: 0.2,
  modal: 0.25,
  stagger: 0.03,
} as const;

// Spring presets
export const SPRING = {
  snappy: { type: "spring" as const, stiffness: 500, damping: 30 },
  gentle: { type: "spring" as const, stiffness: 300, damping: 25 },
};

// Easing
export const EASE = [0.25, 0.1, 0.25, 1] as const;

// Reusable variants
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleInVariants = {
  initial: { scale: 0.95, opacity: 0, y: 10 },
  animate: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.97, opacity: 0, y: 5 },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: DURATION.stagger },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.normal } },
};
