/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { motion } from 'framer-motion';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Film, Sparkles, Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = 100 / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[200] bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 dark:from-black dark:via-indigo-950 dark:to-purple-950 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/20 to-indigo-500/20 blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo with Pulse Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          {/* Glow Effect */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl rounded-full"
          />
          
          {/* Logo Container */}
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-2xl">
            <div className="w-full h-full rounded-3xl bg-white dark:bg-neutral-900 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Film className="w-12 h-12 text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Cameo Studio
          </h1>
          <p className="text-indigo-300 text-sm font-medium tracking-widest uppercase flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Video Generation
            <Zap className="w-4 h-4" />
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 200, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative"
        >
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-indigo-500/50"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          
          {/* Progress Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-white/60 text-xs font-semibold mt-3 tracking-wider"
          >
            {Math.round(progress)}%
          </motion.p>
        </motion.div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Bottom Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] text-center"
      >
        Powered by Google Veo
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
