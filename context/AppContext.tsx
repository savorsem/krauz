/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useContext, useState, useCallback } from 'react';
import { FeedPost, CameoProfile, GenerateVideoParams, PostStatus } from '../types';

// Sample video URLs for the feed
const sampleVideos: FeedPost[] = [
  {
    id: 's1',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-alisa.mp4',
    username: 'alisa_fortin',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Maria',
    description: 'Sipping coffee at a parisian cafe',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's2',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-omar.mp4',
    username: 'osanseviero',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Emery',
    description: 'At a llama petting zoo',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's3',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-ammaar.mp4',
    username: 'ammaar',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Kimberly',
    description: 'At a red carpet ceremony',
    modelTag: 'Veo',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's4',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-logan.mp4',
    username: 'OfficialLoganK',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jocelyn',
    description: 'Vibe coding on a mountain.',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's5',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-kat.mp4',
    username: 'kat_kampf',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jameson',
    description: 'Exploring a majestic temple in a forest.',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's6',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-josh.mp4',
    username: 'joshwoodward',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade',
    description: 'On the Google Keynote stage.',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
];

export interface KnowledgeItem {
  id: string;
  type: 'document' | 'video' | 'image' | 'audio';
  name: string;
  size: string;
  uploadedAt: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: { type: string; name: string; url?: string }[];
}

interface AppContextType {
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // Panel states
  isPlanPanelOpen: boolean;
  setIsPlanPanelOpen: (open: boolean) => void;
  isChatPanelOpen: boolean;
  setIsChatPanelOpen: (open: boolean) => void;
  
  // Feed data
  feed: FeedPost[];
  setFeed: React.Dispatch<React.SetStateAction<FeedPost[]>>;
  updateFeedPost: (id: string, updates: Partial<FeedPost>) => void;
  
  // Avatars
  avatars: CameoProfile[];
  setAvatars: React.Dispatch<React.SetStateAction<CameoProfile[]>>;
  selectedAvatar: CameoProfile | null;
  setSelectedAvatar: (avatar: CameoProfile | null) => void;
  
  // Knowledge base
  knowledgeItems: KnowledgeItem[];
  addKnowledgeItem: (item: Omit<KnowledgeItem, 'id'>) => void;
  removeKnowledgeItem: (id: string) => void;
  
  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  
  // Error handling
  errorToast: string | null;
  setErrorToast: (error: string | null) => void;
  
  // API Key dialog
  showApiKeyDialog: boolean;
  setShowApiKeyDialog: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultAvatars: CameoProfile[] = [
  { id: '1', name: 'Alex', imageUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=asr&backgroundColor=transparent' },
  { id: '2', name: 'Sam', imageUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=skirano&backgroundColor=transparent' },
  { id: '3', name: 'Jordan', imageUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=lc99&backgroundColor=transparent' },
  { id: '4', name: 'Taylor', imageUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=sama&backgroundColor=transparent' },
  { id: '5', name: 'Morgan', imageUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=justinem&backgroundColor=transparent' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('main');
  const [isPlanPanelOpen, setIsPlanPanelOpen] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [feed, setFeed] = useState<FeedPost[]>(sampleVideos);
  const [avatars, setAvatars] = useState<CameoProfile[]>(defaultAvatars);
  const [selectedAvatar, setSelectedAvatar] = useState<CameoProfile | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const updateFeedPost = useCallback((id: string, updates: Partial<FeedPost>) => {
    setFeed(prevFeed => 
      prevFeed.map(post => 
        post.id === id ? { ...post, ...updates } : post
      )
    );
  }, []);

  const addKnowledgeItem = useCallback((item: Omit<KnowledgeItem, 'id'>) => {
    const newItem: KnowledgeItem = {
      ...item,
      id: `kb-${Date.now()}`,
    };
    setKnowledgeItems(prev => [newItem, ...prev]);
  }, []);

  const removeKnowledgeItem = useCallback((id: string) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const addChatMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMessage]);
  }, []);

  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      isPlanPanelOpen,
      setIsPlanPanelOpen,
      isChatPanelOpen,
      setIsChatPanelOpen,
      feed,
      setFeed,
      updateFeedPost,
      avatars,
      setAvatars,
      selectedAvatar,
      setSelectedAvatar,
      knowledgeItems,
      addKnowledgeItem,
      removeKnowledgeItem,
      chatMessages,
      addChatMessage,
      clearChat,
      errorToast,
      setErrorToast,
      showApiKeyDialog,
      setShowApiKeyDialog,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
