/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import BottomPromptBar from './components/BottomPromptBar';
import VideoCard from './components/VideoCard';
import SplashScreen from './components/SplashScreen';
import { generateVideo } from './services/geminiService';
import { FeedPost, GenerateVideoParams, PostStatus } from './types';
import { saveToDB, getAllFromDB, deleteFromDB, STORES_CONST } from './utils/db';
import { X, Film } from 'lucide-react';

// Sample video URLs for the feed
const sampleVideos: FeedPost[] = [
  {
    id: 's1',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-alisa.mp4',
    username: 'alisa_fortin',
    avatarUrl: '',
    description: 'Пью кофе в уютном парижском кафе ☕️',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's2',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-omar.mp4',
    username: 'osanseviero',
    avatarUrl: '',
    description: 'В зоопарке с ламами 🦙',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's3',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-ammaar.mp4',
    username: 'ammaar',
    avatarUrl: '',
    description: 'На красной ковровой дорожке ✨',
    modelTag: 'Veo',
    status: PostStatus.SUCCESS,
  },
];

const App: React.FC = () => {
  const [loadingApp, setLoadingApp] = useState(true);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);

  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      try {
        const storedPosts = await getAllFromDB<FeedPost>(STORES_CONST.FEED);
        const sortedStored = storedPosts.sort((a, b) => Number(b.id) - Number(a.id));
        const safeStored = sortedStored.filter(p => !p.id.startsWith('s'));
        setFeed([...safeStored, ...sampleVideos]);
      } catch (e) {
        console.error("Failed to load from DB", e);
        setFeed(sampleVideos);
      }
    };
    initData();
  }, []);

  const handleSplashComplete = () => {
    setLoadingApp(false);
  };

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

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
      reader.readAsDataURL(blob);
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
      updateFeedPost(postId, { status: PostStatus.ERROR, errorMessage: errorMessage });
      
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('API_KEY') || errorMessage.includes('403') || errorMessage.includes('permission')) {
            setErrorToast('Ошибка доступа. Проверьте API ключ.');
        } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
            setErrorToast('Запрос заблокирован фильтрами.');
        } else {
            setErrorToast('Ошибка генерации.');
        }
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
        console.warn("API Key check failed.", error);
        setShowApiKeyDialog(true);
        return;
      }
    }

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

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
      } catch (e) {
        console.error(e);
        setErrorToast("Не удалось открыть выбор ключа.");
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white flex flex-col overflow-hidden font-sans relative">
      <div className="absolute inset-0 bg-noise pointer-events-none z-0"></div>
      
      <AnimatePresence>
        {loadingApp && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {showApiKeyDialog && <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />}
      
      {/* Error Toast */}
      <AnimatePresence>
        {errorToast && (
            <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 32, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-0 left-1/2 -translate-x-1/2 z-[60] bg-white/90 dark:bg-neutral-800/90 border border-red-500/20 text-red-600 dark:text-red-400 px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl text-sm font-semibold flex items-center gap-3 ring-1 ring-black/5"
            >
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse"></div>
                {errorToast}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md flex items-center justify-center overflow-hidden"
          >
            <div className="absolute top-6 right-6 z-50">
              <button 
                onClick={() => setSelectedPost(null)}
                className="w-12 h-12 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
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
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Grid */}
      <main className="flex-1 h-full relative overflow-y-auto no-scrollbar z-10">
        <div className="w-full min-h-full pb-40">
          {feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 dark:text-neutral-600">
               <Film className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-sm font-medium uppercase tracking-widest opacity-40">Лента пуста</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-[1px]">
              <AnimatePresence initial={false} mode="popLayout">
                {feed.map((post) => (
                  <VideoCard 
                    key={post.id} 
                    post={post} 
                    onClick={() => setSelectedPost(post)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {!loadingApp && !selectedPost && <BottomPromptBar onGenerate={handleGenerate} />}
    </div>
  );
};

export default App;