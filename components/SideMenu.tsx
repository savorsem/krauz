/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Users, Clock, Settings, Puzzle, Github, LogOut, ChevronRight, Key } from 'lucide-react';
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
  { id: AppView.FEED, label: 'Генерации', icon: Film },
  { id: AppView.AVATARS, label: 'Мои Аватары', icon: Users },
  { id: AppView.HISTORY, label: 'История', icon: Clock },
  { id: AppView.INTEGRATIONS, label: 'Интеграции', icon: Puzzle },
  { id: AppView.SETTINGS, label: 'Настройки', icon: Settings },
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-neutral-900 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-neutral-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Меню</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-neutral-400" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {/* API Settings - First item */}
              <button
                onClick={handleAPISettingsClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors group"
              >
                <Key className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">API Settings</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Regular menu items */}
              {MENU_ITEMS.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${
                      isActive
                        ? 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-neutral-800">
              <a
                href="https://github.com/savorsem/krauz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">GitHub</span>
              </a>
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
