"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  holographic?: boolean;
  glow?: "cyan" | "purple" | "none";
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, holographic, glow = "none", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-panel rounded-2xl",
          holographic && "holographic-border",
          glow === "cyan" && "shadow-[var(--glow-cyan)]",
          glow === "purple" && "shadow-[var(--glow-purple)]",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassPanel.displayName = "GlassPanel";
