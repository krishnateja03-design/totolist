import { motion } from "framer-motion";

/**
 * BackgroundBlobs renders subtle ambient gradient orbs behind the app.
 * Kept very muted so they don't distract from content (professional SaaS look).
 */
const blobs = [
  { color: "bg-indigo-300", pos: "top-0 left-10", delay: 0 },
  { color: "bg-violet-300", pos: "top-1/4 right-0", delay: 3 },
  { color: "bg-sky-200", pos: "bottom-1/3 left-1/4", delay: 6 },
];

export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-100 dark:bg-[#060818]">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />
      {/* Ambient orbs */}
      {blobs.map(({ color, pos, delay }, i) => (
        <motion.div
          key={i}
          className={`absolute ${pos} h-96 w-96 rounded-full ${color} opacity-[0.12] dark:opacity-[0.07] blur-3xl`}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20 + i * 4,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
