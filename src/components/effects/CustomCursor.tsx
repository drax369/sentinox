"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });
  const trailX = useSpring(cursorX, { stiffness: 150, damping: 20 });
  const trailY = useSpring(cursorY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) return;

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setVisible(true);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHovering(!!t.closest("a,button,[data-magnetic]"));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference hidden md:block"
        style={{ x: springX, y: springY }}
        animate={{ opacity: visible ? 1 : 0, scale: hovering ? 1.8 : 1 }}
      >
        <div className="-translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full border border-cyan-400 bg-cyan-400/30 shadow-[0_0_12px_#00f5ff]" />
      </motion.div>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] hidden md:block"
        style={{ x: trailX, y: trailY }}
        animate={{ opacity: visible ? 0.35 : 0 }}
      >
        <motion.div className="-translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-cyan-400/30" />
      </motion.div>
    </>
  );
}
