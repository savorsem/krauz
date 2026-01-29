/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import ApiKeyDialog from './components/ApiKeyDialog';
import MenuPanel from './components/MenuPanel';
import MainPanel from './components/MainPanel';
import ChatPanel from './components/ChatPanel';

const AppContent: React.FC = () => {
  const { 
    currentPanel, 
    setCurrentPanel,
    errorToast, 
    setErrorToast, 
    showApiKeyDialog, 
    setShowApiKeyDialog 
  } = useApp();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-dismiss error toast
  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast, setErrorToast]);

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };

  // Touch/Mouse handlers for swipe
  const handleStart = (clientX: number) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || isTransitioning) return;
    const diff = clientX - startX;
    // Limit drag distance
    const maxDrag = window.innerWidth * 0.5;
    setTranslateX(Math.max(-maxDrag, Math.min(maxDrag, diff)));
  };

  const handleEnd = () => {
    if (!isDragging || isTransitioning) return;
    setIsDragging(false);
    
    const threshold = window.innerWidth * 0.15;
    
    if (translateX > threshold && currentPanel > 0) {
      // Swipe right - go to previous panel
      setIsTransitioning(true);
      setCurrentPanel(currentPanel - 1);
    } else if (translateX < -threshold && currentPanel < 2) {
      // Swipe left - go to next panel
      setIsTransitioning(true);
      setCurrentPanel(currentPanel + 1);
    }
    
    setTranslateX(0);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const panelOffset = -currentPanel * 100;
  const dragOffset = isDragging ? (translateX / window.innerWidth) * 100 : 0;

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20 selection:text-foreground">
      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}
      
      {/* Error Toast */}
      {errorToast && (
        <div 
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-card border border-border text-foreground px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl max-w-md text-center text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="w-2 h-2 rounded-full bg-destructive shrink-0 animate-pulse"></div>
          {errorToast}
        </div>
      )}

      {/* Panel indicators */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentPanel(i);
              setTimeout(() => setIsTransitioning(false), 500);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentPanel === i 
                ? 'bg-foreground w-6' 
                : 'bg-foreground/30 hover:bg-foreground/50'
            }`}
          />
        ))}
      </div>

      {/* Three-panel container */}
      <div
        ref={containerRef}
        className="h-full w-[300vw] flex transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(calc(${panelOffset}vw + ${dragOffset}vw))`,
          transitionDuration: isDragging ? '0ms' : '500ms',
        }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {/* Panel 0: Menu */}
        <div className="w-screen h-full shrink-0">
          <MenuPanel />
        </div>
        
        {/* Panel 1: Main */}
        <div className="w-screen h-full shrink-0">
          <MainPanel />
        </div>
        
        {/* Panel 2: Chat */}
        <div className="w-screen h-full shrink-0">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
