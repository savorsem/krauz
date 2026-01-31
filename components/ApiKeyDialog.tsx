/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Key, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Trap focus
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-dialog-title"
    >
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-200/60 dark:bg-black/80 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
        className="relative w-full max-w-md bg-white/80 dark:bg-neutral-900/80 border border-white/50 dark:border-white/10 backdrop-blur-2xl rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="relative z-10 p-8 flex flex-col items-center text-center">
          <div className="relative mb-6" aria-hidden="true">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-gradient-to-tr from-indigo-50 to-white dark:from-white/10 dark:to-white/5 rounded-[24px] border border-white/60 dark:border-white/10 flex items-center justify-center relative overflow-hidden group"
            >
              <Key className="w-10 h-10 text-indigo-600 dark:text-white drop-shadow-sm" />
            </motion.div>
            <motion.div 
              animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white p-1.5 rounded-full shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>
          
          <div className="space-y-3">
            <h2 id="api-key-dialog-title" className="text-3xl font-bold font-bogle tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white">
                Требуется доступ
              </span>
            </h2>
            <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed font-medium max-w-[280px] mx-auto">
              Для создания магии с Veo нужен API ключ от Google Cloud проекта с включенным биллингом.
            </p>
          </div>
          
          <div className="w-full mt-8">
            <button
              ref={buttonRef}
              onClick={onContinue}
              className="group relative w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm tracking-widest uppercase overflow-hidden shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] outline-none focus:ring-4 focus:ring-indigo-500/50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Выбрать API Ключ
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1 text-[11px] text-slate-400 dark:text-gray-500 font-medium">
            <ShieldCheck className="w-3 h-3" aria-hidden="true" />
            <span>Безопасное соединение. Читать про</span>
            <div className="flex gap-1">
              <a
                href="https://ai.google.dev/gemini-api/docs/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-gray-300 hover:text-indigo-600 transition-colors border-b border-transparent hover:border-indigo-600"
              >
                биллинг
              </a>
              <span>и</span>
              <a
                href="https://ai.google.dev/gemini-api/docs/pricing#veo-3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-gray-300 hover:text-indigo-600 transition-colors border-b border-transparent hover:border-indigo-600"
              >
                цены
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ApiKeyDialog;