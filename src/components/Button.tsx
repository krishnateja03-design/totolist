import {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

import { motion } from 'framer-motion';
import { cn } from '../utils/classNames';

export type ButtonVariant = 'primary' | 'gradient' | 'glass' | 'secondary' | 'danger';

type Props = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
>;

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25',
  gradient: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700',
  glass: 'bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-white backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 shadow-sm',
  secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-xs',
  danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25',
};

export function Button({
  className,
  variant = 'primary',
  children,
  ...props
}: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      className={cn(
        'ripple rounded-2xl px-4 py-2.5 font-semibold shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-60 transition-all cursor-pointer inline-flex items-center justify-center',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}