/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import EnhancedSettingsDrawer from './components/EnhancedSettingsDrawer';
import BottomPromptBar from './components/BottomPromptBar';
import VideoCard from './components/VideoCard';
import SplashScreen from './components/SplashScreen';
import SideMenu from './components/SideMenu';
import { VideoEditor } from './components/VideoEditor';
import { generateVideo } from './services/geminiService';
import { FeedPost, GenerateVideoParams, PostStatus, AppView, CameoProfile, CameoImage, VeoModel, IntegrationConfig, IntegrationType } from './types';
import { saveToDB, getAllFromDB, deleteFromDB, STORES_CONST } from './utils/db';
import { X, Film, AlertCircle, Download, Menu, Check, Settings } from 'lucide-react';
import { HistoryView, AvatarsView, SettingsView, IntegrationsView } from './components/Views';

function App() {
  const [loadingApp, setLoadingApp] = useState(true);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [profiles, setProfiles] = useState<CameoProfile[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);

  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [errorToast, setErrorToast] = useState<{message: string, isQuota: boolean} | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Theme
  const [darkMode, setDarkMode] = useState(true);
  const [defaultModel, setDefaultModel] = useState<VeoModel>(VeoModel.VEO_FAST);

  // Navigation
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.FEED);

  // Check for API key on mount
  useEffect(() => {
    const checkApiKey = () => {
      // Check new multi-provider system first
      const providers = localStorage.getItem('api_providers');
      if (providers) {
        try {
          const parsed = JSON.parse(providers);
          const hasEnabledProvider = parsed.some((p: any) => p.enabled && p.key);
          if (!hasEnabledProvider) {
            setShowApiKeyDialog(true);
          }
        } catch (e) {
          // Fallback to old key
          const oldKey = localStorage.getItem('gemini_api_key');
          if (!oldKey) {
            setShowApiKeyDialog(true);
          }
        }
      } else {
        // Fallback to old key
        const oldKey = localStorage.getItem('gemini_api_key');
        if (!oldKey) {
          setShowApiKeyDialog(true);
        }
      }
    };

    checkApiKey();
  }, []);

  // ... rest of your existing App.tsx code stays the same ...
  // I'm only showing the key changes here for brevity
  // The full file would include all your existing logic

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-black' : 'bg-gray-50'}`}>
      {/* Splash Screen */}
      <SplashScreen show={loadingApp} onComplete={() => setLoadingApp(false)} />

      {/* Header with Settings Button */}
      {!loadingApp && (
        <header className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-black/80 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 text-gray-300" />
              </button>
              <div className="flex items-center gap-2">
                <Film className="w-6 h-6 text-indigo-500" />
                <h1 className="text-lg font-bold text-white">Krauz</h1>
              </div>
            </div>
            
            <button
              onClick={() => setShowApiKeyDialog(true)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors group"
              aria-label="Settings"
              title="API Settings"
            >
              <Settings className="w-5 h-5 text-gray-300 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>
        </header>
      )}

      {/* Main Content - Add pt-16 for header spacing */}
      <main className="pt-16">
        {/* Your existing view rendering logic */}
      </main>

      {/* Side Menu */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsMenuOpen(false);
        }}
        onOpenKeySelector={() => {
          setShowApiKeyDialog(true);
          setIsMenuOpen(false);
        }}
      />

      {/* Enhanced Settings Drawer - Replaces old ApiKeyDialog */}
      <EnhancedSettingsDrawer
        isOpen={showApiKeyDialog}
        onClose={() => setShowApiKeyDialog(false)}
      />

      {/* Your existing toasts, modals, etc. */}
    </div>
  );
}

export default App;
