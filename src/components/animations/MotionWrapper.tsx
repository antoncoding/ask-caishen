'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const MotionWrapper = ({ children, className = '', delay = 0 }: MotionWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`font-inter ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const MotionList = ({ children, className = '' }: MotionWrapperProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={`font-inter ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const MotionListItem = ({ children, className = '' }: MotionWrapperProps) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}; 