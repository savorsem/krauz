/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Users, Settings, Key, Github, Sparkles, Zap } from 'lucide-react';
import { AppView } from '../types';
import EnhancedSettingsDrawer from './EnhancedSettingsDrawer';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenKeySelector: () => void;
}

const MENU_ITEMS = [
  { id: AppView.FEED, label: 'Генерации', icon: Film, gradient: 'from-violet-500 to-purple-500' },
  { id: AppView.AVATARS, label: 'Мои Герои', icon: Users, gradient: 'from-blue-500 to-cyan-500' },
  { id: AppView.SETTINGS, label: 'Настройки', icon: Settings, gradient: 'from-slate-500 to-gray-500' },
];

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, currentView, onNavigate, onOpenKeySelector }) => {
  const [showEnhancedSettings, setShowEnhancedSettings] = React.useState(false);

  const handleAPISettingsClick = () => {
    onClose();
    setShowEnhancedSettings(true);
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 glass-strong border-r border-white/10 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header with branding */}
            <div className="p-6 border-b border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Cameo Studio</h2>
                    <p className="text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-widest font-bold">AI Video Gen</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-neutral-400" />
                </button>
              </div>
            </div>

            {/* API Settings - Highlighted */}
            <div className="p-4">
              <button
                onClick={handleAPISettingsClick}
                className="w-full group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-sm">API Settings</div>
                    <div className="text-[10px] opacity-80 font-medium">Управление ключами</div>
                  </div>
                  <Zap className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-white/30 mb-3 px-2">Навигация</p>
              {MENU_ITEMS.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white dark:bg-white/10 shadow-lg scale-[1.02]'
                        : 'hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isActive 
                        ? `bg-gradient-to-br ${item.gradient} text-white shadow-md` 
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60'
                    }`}>
                      <item.icon className="w-4.5 h-4.5" />
                    </div>
                    <span className={`flex-1 text-left font-semibold text-sm ${
                      isActive 
                        ? 'text-slate-900 dark:text-white' 
                        : 'text-slate-600 dark:text-white/60'
                    }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 backdrop-blur-xl space-y-2">
              <a
                href="https://github.com/savorsem/krauz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-white/5 rounded-xl transition-all group active:scale-95"
              >
                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left font-medium text-sm">View on GitHub</span>
              </a>
              <div className="px-4 py-2 text-center">
                <p className="text-[9px] text-slate-400 dark:text-white/20 uppercase tracking-widest font-bold">v1.0.0 • Powered by Veo</p>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Settings Drawer */}
          <EnhancedSettingsDrawer
            isOpen={showEnhancedSettings}
            onClose={() => setShowEnhancedSettings(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;
