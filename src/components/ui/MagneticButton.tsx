"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { type ReactNode, useRef } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "ghost" | "outline";
}

export function MagneticButton({
  children,
  className,
  onClick,
  type = "button",
  disabled,
  variant = "primary",
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/40 text-cyan-100 hover:shadow-[var(--glow-cyan)]",
    ghost: "bg-transparent border-white/10 text-slate-300 hover:border-cyan-400/30",
    outline:
      "bg-transparent border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/10",
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-xl border px-6 py-3 text-sm font-medium tracking-wide transition-shadow duration-300",
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-purple-400/0"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
}
