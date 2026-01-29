/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useContext, useState, useCallback } from 'react';
import { FeedPost, CameoProfile, PostStatus } from '../types';

// Sample video URLs for the feed
const sampleVideos: FeedPost[] = [
  {
    id: 's1',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-alisa.mp4',
    username: 'alisa_fortin',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Maria',
    description: 'Пьет кофе в парижском кафе',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's2',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-omar.mp4',
    username: 'osanseviero',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Emery',
    description: 'В контактном зоопарке с ламами',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's3',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-ammaar.mp4',
    username: 'ammaar',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Kimberly',
    description: 'На красной дорожке церемонии',
    modelTag: 'Veo',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's4',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-logan.mp4',
    username: 'OfficialLoganK',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jocelyn',
    description: 'Кодит на вершине горы',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's5',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-kat.mp4',
    username: 'kat_kampf',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jameson',
    description: 'Исследует величественный храм в лесу',
    modelTag: 'Veo Fast',
    status: PostStatus.SUCCESS,
  },
  {
    id: 's6',
    videoUrl: 'https://storage.googleapis.com/sideprojects-asronline/veo-cameos/cameo-josh.mp4',
    username: 'joshwoodward',
    avatarUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade',
    description: 'На сцене Google Keynote',
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
  // Current panel (0 = menu, 1 = main, 2 = chat)
  currentPanel: number;
  setCurrentPanel: (panel: number) => void;
  
  // Menu page selection
  menuPage: string | null;
  setMenuPage: (page: string | null) => void;
  
  // Feed data
  feed: FeedPost[];
  setFeed: React.Dispatch<React.SetStateAction<FeedPost[]>>;
  updateFeedPost: (id: string, updates: Partial<FeedPost>) => void;
  
  // Avatars (user uploaded only)
  avatars: CameoProfile[];
  setAvatars: React.Dispatch<React.SetStateAction<CameoProfile[]>>;
  
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPanel, setCurrentPanel] = useState(1); // Start at main (center)
  const [menuPage, setMenuPage] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedPost[]>(sampleVideos);
  const [avatars, setAvatars] = useState<CameoProfile[]>([]); // No default avatars
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
      currentPanel,
      setCurrentPanel,
      menuPage,
      setMenuPage,
      feed,
      setFeed,
      updateFeedPost,
      avatars,
      setAvatars,
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
