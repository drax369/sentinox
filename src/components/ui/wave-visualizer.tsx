"use client";

import { useEffect, useRef } from "react";

export function WaveVisualizer({ active }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let raf = 0;
    const waveData = Array.from({ length: 8 }, () => ({
      value: Math.random() * 0.5 + 0.1,
      target: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.01,
    }));

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      waveData.forEach((data, i) => {
        if (active && Math.random() < 0.02) data.target = Math.random() * 0.7 + 0.1;
        data.value += (data.target - data.value) * data.speed;
        const freq = data.value * (active ? 9 : 5);
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const nx = (x / canvas.width) * 2 - 1;
          const px = nx + i * 0.04 + freq * 0.03;
          const py =
            Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.08 * ((i + 1) / 8);
          const y = (py + 1) * (canvas.height / 2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const intensity = Math.min(1, freq * 0.35);
        ctx.lineWidth = 1 + i * 0.25;
        ctx.strokeStyle = `rgba(0,245,255,${0.15 + intensity * 0.45})`;
        ctx.stroke();
      });
    };

    const loop = () => {
      time += active ? 0.03 : 0.015;
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      aria-hidden
    />
  );
}
