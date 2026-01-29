/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VideoCard from '../components/VideoCard';
import BottomPromptBar from '../components/BottomPromptBar';
import { generateVideo } from '../services/geminiService';
import { FeedPost, GenerateVideoParams, PostStatus } from '../types';
import { ChevronLeft, ChevronRight, MessageSquare, CreditCard } from 'lucide-react';

const MainPage: React.FC = () => {
  const { 
    feed, 
    setFeed, 
    updateFeedPost, 
    setErrorToast, 
    setShowApiKeyDialog,
    setIsPlanPanelOpen,
    setIsChatPanelOpen
  } = useApp();

  const processGeneration = async (postId: string, params: GenerateVideoParams) => {
    try {
      const { url } = await generateVideo(params);
      updateFeedPost(postId, { videoUrl: url, status: PostStatus.SUCCESS });
    } catch (error) {
      console.error('Video generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error.';
      updateFeedPost(postId, { status: PostStatus.ERROR, errorMessage: errorMessage });
      
      if (typeof errorMessage === 'string' && (
          errorMessage.includes('API_KEY_INVALID') || 
          errorMessage.includes('permission denied') ||
          errorMessage.includes('Requested entity was not found')
      )) {
        setErrorToast('Invalid API key or permissions. Please check billing.');
      }
    }
  };

  const handleGenerate = useCallback(async (params: GenerateVideoParams) => {
    if (window.aistudio) {
      try {
        if (!(await window.aistudio.hasSelectedApiKey())) {
          setShowApiKeyDialog(true);
          return;
        }
      } catch (error) {
        setShowApiKeyDialog(true);
        return;
      }
    }

    const newPostId = Date.now().toString();
    const refImage = params.referenceImages?.[0]?.base64;

    const newPost: FeedPost = {
      id: newPostId,
      username: 'you',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
      description: params.prompt,
      modelTag: params.model === 'veo-3.1-fast-generate-preview' ? 'Veo Fast' : 'Veo',
      status: PostStatus.GENERATING,
      referenceImageBase64: refImage,
    };

    setFeed(prev => [newPost, ...prev]);
    processGeneration(newPostId, params);
  }, [setFeed, setShowApiKeyDialog, setErrorToast, updateFeedPost]);

  return (
    <div className="h-full relative overflow-y-auto overflow-x-hidden no-scrollbar">
      {/* Ambient background light */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_hsl(var(--primary)/0.1),_transparent_70%)]" />

      {/* Swipe indicators */}
      <div className="fixed left-2 top-1/2 -translate-y-1/2 z-30 md:hidden">
        <button 
          onClick={() => setIsPlanPanelOpen(true)}
          className="p-2 bg-card/80 backdrop-blur-sm rounded-full border border-border shadow-lg"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <span className="block text-[10px] text-muted-foreground text-center mt-1">Plans</span>
      </div>

      <div className="fixed right-2 top-1/2 -translate-y-1/2 z-30 md:hidden">
        <button 
          onClick={() => setIsChatPanelOpen(true)}
          className="p-2 bg-card/80 backdrop-blur-sm rounded-full border border-border shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <span className="block text-[10px] text-muted-foreground text-center mt-1">AI Chat</span>
      </div>

      {/* Desktop side buttons */}
      <div className="hidden md:flex fixed left-24 top-4 z-30 gap-2">
        <button 
          onClick={() => setIsPlanPanelOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-xl border border-border transition-colors"
        >
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Plans</span>
        </button>
      </div>

      <div className="hidden md:flex fixed right-4 top-4 z-30 gap-2">
        <button 
          onClick={() => setIsChatPanelOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted rounded-xl border border-border transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">AI Assistant</span>
        </button>
      </div>

      {/* Video Grid */}
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 md:pl-24 pb-48 pt-16 md:pt-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {feed.map((post) => (
            <VideoCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      <BottomPromptBar onGenerate={handleGenerate} />
    </div>
  );
};

export default MainPage;
