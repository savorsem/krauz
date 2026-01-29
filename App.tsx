/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import ApiKeyDialog from './components/ApiKeyDialog';
import Navigation from './components/Navigation';
import SwipeContainer from './components/SwipeContainer';
import PlanPanel from './components/PlanPanel';
import AIChatPanel from './components/AIChatPanel';
import MainPage from './pages/MainPage';
import AvatarsPage from './pages/AvatarsPage';
import GenerationsPage from './pages/GenerationsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import SettingsPage from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { 
    currentPage, 
    errorToast, 
    setErrorToast, 
    showApiKeyDialog, 
    setShowApiKeyDialog 
  } = useApp();

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

  const renderPage = () => {
    switch (currentPage) {
      case 'avatars':
        return <AvatarsPage />;
      case 'generations':
        return <GenerationsPage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <MainPage />;
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden font-sans selection:bg-primary/20 selection:text-foreground">
      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}
      
      {/* Error Toast */}
      {errorToast && (
        <div 
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-card border border-border text-foreground px-5 py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl max-w-md text-center text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="w-2 h-2 rounded-full bg-destructive shrink-0 animate-pulse"></div>
          {errorToast}
        </div>
      )}

      {/* Navigation */}
      <Navigation />

      {/* Main Content with Swipe Support */}
      <main className="flex-1 h-full relative overflow-hidden md:pl-20 pb-16 md:pb-0">
        <SwipeContainer>
          {renderPage()}
        </SwipeContainer>
      </main>

      {/* Slide-out Panels */}
      <PlanPanel />
      <AIChatPanel />
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
