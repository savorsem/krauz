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

const App: React.FC = () => {
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
  
  // Settings State
  const [darkMode, setDarkMode] = useState(true);
  const [defaultModel, setDefaultModel] = useState<VeoModel>(VeoModel.VEO_FAST);

  // Navigation State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.FEED);

  // Handle PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Theme init
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
      if (darkMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [darkMode]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingPost) setEditingPost(null);
        else if (selectedPost) setSelectedPost(null);
        else if (showApiKeyDialog) setShowApiKeyDialog(false);
        else if (isMenuOpen) setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingPost, selectedPost, showApiKeyDialog, isMenuOpen]);

  const loadProfiles = useCallback(async () => {
    try {
      const stored = await getAllFromDB<CameoProfile>(STORES_CONST.PROFILES);
      setProfiles(stored.reverse());
    } catch (e) {
      console.error("Failed to load profiles", e);
    }
  }, []);

  const loadIntegrations = useCallback(async () => {
      try {
          const stored = await getAllFromDB<IntegrationConfig>(STORES_CONST.INTEGRATIONS);
          const defaults: IntegrationConfig[] = [
              { id: IntegrationType.YOUTUBE, name: 'YouTube Shorts', isEnabled: false, config: {} },
              { id: IntegrationType.TIKTOK, name: 'TikTok', isEnabled: false, config: {} },
              { id: IntegrationType.INSTAGRAM, name: 'Instagram Reels', isEnabled: false, config: {} },
              { id: IntegrationType.DISCORD, name: 'Discord Webhook', isEnabled: false, config: {} },
              { id: IntegrationType.ZAPIER, name: 'Zapier', isEnabled: false, config: {} },
              { id: IntegrationType.WEBHOOK, name: 'Custom MCP', isEnabled: false, config: {} }
          ];
          
          // Merge defaults with stored to ensure all types exist
          const merged = defaults.map(def => {
              const found = stored.find(s => s.id === def.id);
              return found || def;
          });
          setIntegrations(merged);
      } catch (e) { console.error(e); }
  }, []);

  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      try {
        const storedPosts = await getAllFromDB<FeedPost>(STORES_CONST.FEED);
        const sortedStored = storedPosts.sort((a, b) => Number(b.id) - Number(a.id));
        const safeStored = sortedStored.filter(p => !p.id.startsWith('s'));
        
        const sampleVideos: FeedPost[] = [
          { id: 's1', videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-alisa.mp4', username: 'alisa_fortin', avatarUrl: '', description: 'Пью кофе в уютном парижском кафе ☕️', modelTag: 'Veo Fast', status: PostStatus.SUCCESS },
          { id: 's2', videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-omar.mp4', username: 'osanseviero', avatarUrl: '', description: 'В зоопарке с ламами 🦙', modelTag: 'Veo Fast', status: PostStatus.SUCCESS },
          { id: 's3', videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-ammaar.mp4', username: 'ammaar', avatarUrl: '', description: 'На красной ковровой дорожке ✨', modelTag: 'Veo', status: PostStatus.SUCCESS }
        ];

        setFeed([...safeStored, ...sampleVideos]);
        await loadProfiles();
        await loadIntegrations();
      } catch (e) {
        console.error("Failed to load from DB", e);
      }
    };
    initData();
  }, [loadProfiles, loadIntegrations]);

  const handleSplashComplete = () => {
    setLoadingApp(false);
  };

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);
  
  useEffect(() => {
    if (successToast) {
        const timer = setTimeout(() => setSuccessToast(null), 4000);
        return () => clearTimeout(timer);
    }
  }, [successToast]);

  const updateFeedPost = useCallback((id: string, updates: Partial<FeedPost>) => {
    setFeed(prevFeed => {
      const newFeed = prevFeed.map(post => {
        if (post.id === id) {
          const updatedPost = { ...post, ...updates };
          if ((updates.status === PostStatus.SUCCESS || updates.status === PostStatus.ERROR) && !id.startsWith('s')) {
             saveToDB(STORES_CONST.FEED, updatedPost).catch(console.error);
          }
          return updatedPost;
        }
        return post;
      });
      return newFeed;
    });
  }, []);

  const handleDeletePost = async (id: string) => {
    if (window.confirm("Удалить это видео?")) {
        setFeed(prev => prev.filter(p => p.id !== id));
        if (selectedPost?.id === id) {
            setSelectedPost(null);
        }
        if (!id.startsWith('s')) {
          try {
            await deleteFromDB(STORES_CONST.FEED, id);
          } catch (e) {
            console.error(e);
          }
        }
    }
  };

  const processGeneration = async (postId: string, params: GenerateVideoParams) => {
    try {
      const { url, blob } = await generateVideo(params);
      const reader = new FileReader();
      reader.readAsDataURL(blob as any);
      reader.onloadend = () => {
         const base64data = reader.result as string;
         updateFeedPost(postId, { videoUrl: base64data, status: PostStatus.SUCCESS });
      };
      reader.onerror = () => {
          throw new Error("Failed to process generated video data.");
      };
    } catch (error) {
      console.error('Video generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка.';
      
      const isQuota = errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('billing');
      const isNotFound = errorMessage.includes('Requested entity was not found');
      
      updateFeedPost(postId, { status: PostStatus.ERROR, errorMessage: errorMessage });
      setErrorToast({ message: isQuota ? 'Лимит исчерпан или биллинг не активен.' : errorMessage, isQuota });

      if (isNotFound && window.aistudio) {
        window.aistudio.openSelectKey().catch(console.error);
      }
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
        } catch (e) {
            setErrorToast({ message: "Не удалось открыть выбор ключа.", isQuota: false });
        }
    }
  };

  const handleGenerate = useCallback(async (params: GenerateVideoParams) => {
    if (window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setShowApiKeyDialog(true);
          return;
        }
      } catch (error) {
        setShowApiKeyDialog(true);
        return;
      }
    }

    // Switch to feed when generating
    setCurrentView(AppView.FEED);

    const newPostId = Date.now().toString();
    const refImage = params.referenceImages?.[0]?.base64;

    const newPost: FeedPost = {
      id: newPostId,
      username: 'you',
      avatarUrl: '',
      description: params.prompt,
      modelTag: params.model.includes('fast') ? 'Veo Fast' : 'Veo',
      status: PostStatus.GENERATING,
      referenceImageBase64: refImage,
    };

    setFeed(prev => [newPost, ...prev]);
    saveToDB(STORES_CONST.FEED, newPost).catch(console.error);
    processGeneration(newPostId, params);
  }, [updateFeedPost]);

  const handleSaveEditedVideo = async (blob: Blob) => {
    if (!editingPost) return;
    setEditingPost(null);
    const newPostId = Date.now().toString();
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
         const base64data = reader.result as string;
         const newPost: FeedPost = {
            id: newPostId,
            username: editingPost.username,
            avatarUrl: editingPost.avatarUrl,
            description: `${editingPost.description} (Edited)`,
            modelTag: editingPost.modelTag,
            status: PostStatus.SUCCESS,
            referenceImageBase64: editingPost.referenceImageBase64,
            videoUrl: base64data
         };
         setFeed(prev => [newPost, ...prev]);
         saveToDB(STORES_CONST.FEED, newPost).catch(console.error);
         setTimeout(() => setSelectedPost(newPost), 500);
    };
  };

  const handleAddToCameo = async (base64: string) => {
    const name = window.prompt("Как зовут этого героя?");
    if (name) {
      const newImg: CameoImage = {
        id: `img-${Date.now()}`,
        url: `data:image/jpeg;base64,${base64}`,
        base64: base64
      };
      
      const newProfile: CameoProfile = {
        id: `char-${Date.now()}`,
        name: name,
        images: [newImg]
      };
      
      try {
        await saveToDB(STORES_CONST.PROFILES, newProfile);
        await loadProfiles();
        setCurrentView(AppView.AVATARS);
        setSelectedPost(null);
      } catch (e) {
        console.error("Failed to save profile", e);
        setErrorToast({ message: "Не удалось сохранить персонажа.", isQuota: false });
      }
    }
  };

  const handleShareVideo = async (post: FeedPost) => {
      if (!post.videoUrl) return;

      const activeWebhooks = integrations.filter(i => 
          i.isEnabled && 
          (i.id === IntegrationType.DISCORD || i.id === IntegrationType.ZAPIER || i.id === IntegrationType.WEBHOOK)
      );

      let sharedCount = 0;

      if (activeWebhooks.length > 0) {
          setSuccessToast(`Публикация в ${activeWebhooks.length} канал(ов)...`);
          try {
              const res = await fetch(post.videoUrl);
              const blob = await res.blob();
              const filename = `cameo-${post.id}.mp4`;

              await Promise.all(activeWebhooks.map(async (integration) => {
                  if (!integration.config.webhookUrl) return;
                  
                  const formData = new FormData();
                  formData.append('file', blob, filename);
                  formData.append('video_url', post.videoUrl || '');
                  formData.append('description', post.description);
                  formData.append('username', post.username);
                  formData.append('model', post.modelTag);
                  formData.append('timestamp', new Date().toISOString());
                  
                  if (integration.id === IntegrationType.DISCORD) {
                       formData.append('content', `**New Cameo**\n${post.description}`);
                  }

                  try {
                    const response = await fetch(integration.config.webhookUrl, {
                        method: 'POST',
                        body: formData
                    });
                    if (response.ok) sharedCount++;
                  } catch(err) {
                      console.error(`Failed to push to ${integration.name}`, err);
                  }
              }));
              
              if (sharedCount > 0) {
                  setSuccessToast(`Опубликовано в ${sharedCount} канал(а)!`);
                  return;
              }
          } catch (e) {
              console.error("Share upload failed", e);
              setErrorToast({ message: "Ошибка загрузки видео", isQuota: false });
          }
      }

      if (sharedCount === 0 && navigator.share) {
          try {
              const res = await fetch(post.videoUrl);
              const blob = await res.blob();
              const file = new File([blob], "cameo.mp4", { type: "video/mp4" });
              await navigator.share({
                  title: 'Cameo Video',
                  text: post.description,
                  files: [file]
              });
          } catch (e) { }
      } else if (sharedCount === 0) {
           setErrorToast({ message: "Нет активных интеграций и нативный шеринг недоступен", isQuota: false });
      }
  };

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    handleOpenKeySelector();
  };

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white flex flex-col overflow-hidden font-sans relative" role="application" aria-label="Cameo Studio">
      <div className="absolute inset-0 bg-noise pointer-events-none z-0" aria-hidden="true"></div>
      
      <AnimatePresence>
        {loadingApp && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {showApiKeyDialog && <EnhancedSettingsDrawer isOpen={showApiKeyDialog} onClose={() => setShowApiKeyDialog(false)} />}
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenKeySelector={handleOpenKeySelector}
      />
      
      <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-4 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10 shadow-sm"
                aria-label="Меню"
            >
                <Menu className="w-5 h-5 text-slate-900 dark:text-white" />
            </button>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] hidden sm:block opacity-60 mix-blend-difference text-white">
                {currentView === AppView.FEED ? 'Cameo Studio' : currentView}
            </h1>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
            <button
                onClick={() => setShowApiKeyDialog(true)}
                className="w-10 h-10 bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10 shadow-sm group"
                aria-label="API Settings"
                title="API Settings"
            >
                <Settings className="w-5 h-5 text-slate-900 dark:text-white group-hover:rotate-90 transition-all duration-300" />
            </button>
            {deferredPrompt && (
                <motion.button 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 transition-all active:scale-95 border border-white/10"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden xs:block">Установить</span>
                </motion.button>
            )}
        </div>
      </header>

      <AnimatePresence>
        {editingPost && editingPost.videoUrl && (
            <VideoEditor 
                videoUrl={editingPost.videoUrl}
                onClose={() => setEditingPost(null)}
                onSave={handleSaveEditedVideo}
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorToast && (
            <motion.div 
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 70, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="fixed top-0 left-1/2 z-[60] bg-white dark:bg-neutral-800 px-6 py-4 rounded-3xl shadow-2xl border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold flex flex-col items-center gap-2 min-w-[280px]"
            >
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" aria-hidden="true" />
                    {errorToast.message}
                </div>
                {errorToast.isQuota && (
                    <button 
                        onClick={() => { setErrorToast(null); handleOpenKeySelector(); }}
                        className="mt-1 px-4 py-1.5 bg-red-500 text-white rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-red-600 transition-colors"
                    >
                        Сменить Проект
                    </button>
                )}
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successToast && (
            <motion.div 
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 70, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="fixed top-0 left-1/2 z-[60] bg-white dark:bg-neutral-800 px-6 py-4 rounded-3xl shadow-2xl border border-green-500/20 text-green-500 dark:text-green-400 text-sm font-semibold flex flex-col items-center gap-2 min-w-[280px]"
            >
                <div className="flex items-center gap-3">
                    <Check className="w-5 h-5" aria-hidden="true" />
                    {successToast}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative overflow-y-auto no-scrollbar z-10" role="main">
          {currentView === AppView.FEED && (
             <div className="w-full min-h-full pb-40 pt-0">
                {feed.length === 0 && !loadingApp ? (
                    <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400 dark:text-neutral-600">
                    <Film className="w-16 h-16 mb-4 opacity-20" aria-hidden="true" />
                    <p className="text-sm font-medium uppercase tracking-widest opacity-40">Лента пуста</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px]">
                    <AnimatePresence initial={false} mode="popLayout">
                        {feed.map((post) => (
                        <VideoCard 
                            key={post.id} 
                            post={post} 
                            onClick={() => setSelectedPost(post)}
                            onOpenKeySelector={handleOpenKeySelector}
                            onAddToCameo={handleAddToCameo}
                        />
                        ))}
                    </AnimatePresence>
                    </div>
                )}
             </div>
          )}

          {currentView === AppView.HISTORY && <HistoryView feed={feed} />}
          {currentView === AppView.AVATARS && (
            <AvatarsView 
              profiles={profiles} 
              setProfiles={setProfiles} 
              setCurrentView={setCurrentView} 
            />
          )}
          {currentView === AppView.SETTINGS && (
            <SettingsView 
              darkMode={darkMode} 
              setDarkMode={setDarkMode} 
              defaultModel={defaultModel} 
              setDefaultModel={setDefaultModel} 
              handleOpenKeySelector={handleOpenKeySelector} 
            />
          )}
          {currentView === AppView.INTEGRATIONS && <IntegrationsView integrations={integrations} setIntegrations={setIntegrations} />}
      </main>

      {/* Full Screen Player Overlay */}
      <AnimatePresence>
        {selectedPost && !editingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md flex items-center justify-center overflow-hidden"
          >
            <div className="absolute top-6 right-6 z-50">
              <button 
                onClick={() => setSelectedPost(null)}
                className="w-12 h-12 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="w-full h-full max-w-7xl max-h-screen mx-auto p-0 md:p-8 flex items-center justify-center">
              <VideoCard 
                key={`fullscreen-${selectedPost.id}`}
                post={selectedPost} 
                isFullscreen={true}
                onDelete={() => handleDeletePost(selectedPost.id)}
                onEdit={() => setEditingPost(selectedPost)}
                onAddToCameo={handleAddToCameo}
                onShare={() => handleShareVideo(selectedPost)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Only show prompt bar on Feed view */}
      {!loadingApp && !selectedPost && !editingPost && currentView === AppView.FEED && (
        <BottomPromptBar 
            onGenerate={handleGenerate} 
            defaultModel={defaultModel}
            profiles={profiles}
            onProfilesChange={loadProfiles}
        />
      )}
    </div>
  );
};

export default App;
