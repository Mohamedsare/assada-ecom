"use client";

import { useEffect, useRef } from "react";

/**
 * Explosion de confettis + étincelles jouée une seule fois à l'affichage
 * de la page de victoire (validation de commande). 100 % canvas, sans dépendance.
 * Se désactive automatiquement si l'utilisateur préfère les animations réduites.
 */
export default function SuccessConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Palette RYTA : or, bleu nuit, vert, blanc.
    const colors = ["#B8925A", "#020B27", "#16A34A", "#22C55E", "#FFFFFF", "#E8C88A"];

    type Piece = {
      x: number; y: number; vx: number; vy: number;
      size: number; rot: number; vrot: number;
      color: string; shape: "rect" | "circle"; opacity: number;
    };

    const pieces: Piece[] = [];
    const spawn = (originX: number) => {
      const count = 70;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI - Math.PI / 2; // vers le haut
        const speed = 6 + Math.random() * 9;
        pieces.push({
          x: originX,
          y: height * 0.32,
          vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
          vy: Math.sin(angle) * speed - 4,
          size: 5 + Math.random() * 7,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.4 ? "rect" : "circle",
          opacity: 1,
        });
      }
    };

    // Deux bouffées décalées pour un effet plus riche.
    spawn(width * 0.5);
    setTimeout(() => spawn(width * 0.25), 220);
    setTimeout(() => spawn(width * 0.75), 380);

    const gravity = 0.22;
    const friction = 0.99;
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);

      for (const p of pieces) {
        p.vy += gravity;
        p.vx *= friction;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        if (elapsed > 1600) p.opacity = Math.max(0, p.opacity - 0.02);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (elapsed < 3200) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
