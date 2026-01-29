/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, 
  Users, 
  Video, 
  Plug, 
  Settings,
  Sun,
  Moon
} from 'lucide-react';

const navItems = [
  { id: 'main', label: 'Main', icon: Home },
  { id: 'avatars', label: 'Avatars', icon: Users },
  { id: 'generations', label: 'Generations', icon: Video },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Navigation: React.FC = () => {
  const { currentPage, setCurrentPage, setIsChatPanelOpen, setIsPlanPanelOpen } = useApp();
  const { theme, toggleTheme } = useTheme();

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    setIsChatPanelOpen(false);
    setIsPlanPanelOpen(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:top-0 md:left-0 md:right-auto md:bottom-auto md:h-screen md:w-20">
      <div className="flex md:flex-col items-center justify-around md:justify-start md:pt-6 md:gap-2 h-16 md:h-full bg-background/80 backdrop-blur-xl border-t md:border-t-0 md:border-r border-border">
        {/* Theme toggle - desktop only, at top */}
        <button
          onClick={toggleTheme}
          className="hidden md:flex w-12 h-12 items-center justify-center rounded-xl transition-all text-muted-foreground hover:text-foreground hover:bg-muted mb-4"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center w-14 h-14 md:w-12 md:h-12 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 md:hidden">{item.label}</span>
            </button>
          );
        })}

        {/* Theme toggle - mobile only, in nav */}
        <button
          onClick={toggleTheme}
          className="flex md:hidden flex-col items-center justify-center w-14 h-14 rounded-xl transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-[10px] mt-1">Theme</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
