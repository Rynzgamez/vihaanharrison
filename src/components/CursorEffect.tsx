import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const CursorEffect = () => {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Smooth trailing for the outer ring
  const ringX = useSpring(x, { mass: 0.6, stiffness: 120, damping: 18 });
  const ringY = useSpring(y, { mass: 0.6, stiffness: 120, damping: 18 });

  // Offsets so the cursor is centered
  const dotX = useTransform(x, (v) => v - 8);
  const dotY = useTransform(y, (v) => v - 8);
  const ringXOffset = useTransform(ringX, (v) => v - 16);
  const ringYOffset = useTransform(ringY, (v) => v - 16);

  const [isPointer, setIsPointer] = useState(false);
  const pointerRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        x.set(e.clientX);
        y.set(e.clientY);

        const target = e.target as HTMLElement;
        const next =
          target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          !!target.closest('a') ||
          !!target.closest('button') ||
          window.getComputedStyle(target).cursor === 'pointer';

        if (pointerRef.current !== next) {
          pointerRef.current = next;
          setIsPointer(next);
        }
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [x, y]);

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-accent rounded-full pointer-events-none z-[9999] mix-blend-screen will-change-transform"
        style={{ x: dotX, y: dotY }}
        animate={{ scale: isPointer ? 1.5 : 1 }}
        transition={{ type: "spring", mass: 0.2, stiffness: 100, damping: 10 }}
      />
      
      {/* Outer cursor ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border-2 border-accent/50 rounded-full pointer-events-none z-[9999] will-change-transform"
        style={{ x: ringXOffset, y: ringYOffset }}
        animate={{ scale: isPointer ? 1.8 : 1 }}
        transition={{ type: "spring", mass: 0.6, stiffness: 50, damping: 15 }}
      />
    </>
  );
};

export default CursorEffect;
