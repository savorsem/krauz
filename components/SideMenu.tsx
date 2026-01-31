/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Users, Clock, Settings, Puzzle, Github, LogOut, ChevronRight } from 'lucide-react';
import { AppView } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenKeySelector: () => void;
}

const MENU_ITEMS = [
  { id: AppView.FEED, label: 'Генерации', icon: Film },
  { id: AppView.AVATARS, label: 'Мои Аватары', icon: Users },
  { id: AppView.HISTORY, label: 'История', icon: Clock },
  { id: AppView.INTEGRATIONS, label: 'Интеграции', icon: Puzzle },
  { id: AppView.SETTINGS, label: 'Настройки', icon: Settings },
];

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, currentView, onNavigate, onOpenKeySelector }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 z-[70] w-72 bg-slate-50 dark:bg-[#111] border-r border-slate-200 dark:border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Cameo</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Studio v1.2</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                    <span className="text-sm font-bold tracking-wide">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-black/20">
                <button 
                    onClick={() => { onOpenKeySelector(); onClose(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-indigo-500/50 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">Аккаунт</p>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Сменить ключ</p>
                    </div>
                </button>
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">Powered by Google Gemini</p>
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;