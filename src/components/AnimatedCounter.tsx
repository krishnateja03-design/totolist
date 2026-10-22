import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';

import { useEffect } from 'react';

export function AnimatedCounter({
  value,
  suffix = '',
}: {
  value: number;
  suffix?: string;
}) {
  const mv = useMotionValue(0);

  const rounded = useTransform(
    mv,
    v => `${Math.round(v)}${suffix}`
  );

  useEffect(() => {
    const c = animate(mv, value, {
      duration: 1.1,
    });

    return c.stop;
  }, [value]);

  return (
    <motion.span>
      {rounded}
    </motion.span>
  );
}