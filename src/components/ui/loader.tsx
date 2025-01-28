import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'dots' | 'pulse';
}

export function Loader({ message = 'Loading...', size = 'medium', type = 'spinner' }: LoaderProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const renderSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} border-4 border-t-purple-600 border-r-purple-600 border-b-purple-300 border-l-purple-300 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-3 h-3' : 'w-4 h-4'} bg-purple-600 rounded-full`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={`${sizeClasses[size]} bg-purple-600 rounded-full`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      {type === 'spinner' && renderSpinner()}
      {type === 'dots' && renderDots()}
      {type === 'pulse' && renderPulse()}
      {message && (
        <p className="text-gray-600 dark:text-gray-300 text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
