import { motion } from "framer-motion";
export function ProgressBar({
  value,
  gradient = "from-indigo-500 to-violet-500",
}: {
  value: number;
  gradient?: string;
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, type: "spring" }}
        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
      />
    </div>
  );
}
