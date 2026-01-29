/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateVideo } from '../services/geminiService';
import { FeedPost, GenerateVideoParams, PostStatus, AspectRatio, GenerationMode, Resolution, VeoModel, ImageFile, CameoProfile } from '../types';
import { ArrowUp, Plus, AlertCircle, Download, Sparkles } from 'lucide-react';

const examplePrompts = [
  "Кодит на заснеженной вершине горы...",
  "Прыгает с парашютом над Багамами...",
  "Идет по красной дорожке премьеры...",
  "Пилотирует космический корабль через туманность...",
  "Диджеит на огромном неоновом фестивале...",
  "Открывает древний храм в джунглях...",
  "Пьет кофе в уютном парижском кафе...",
  "Серфит на гигантской волне на закате...",
];

// Helper to convert file to base64
const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        if (base64) {
          resolve({ file, base64 });
        } else {
          reject(new Error('Failed to extract base64 data.'));
        }
      } else {
        reject(new Error('FileReader result is not a string.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// VeoLogo component
const VeoLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

// VideoCard component
const VideoCard: React.FC<{ post: FeedPost }> = ({ post }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && post.status === PostStatus.SUCCESS) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleDownload = async () => {
    if (post.videoUrl) {
      try {
        const response = await fetch(post.videoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-${post.id}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const status = post.status;

  const renderContent = () => {
    switch (status) {
      case PostStatus.GENERATING:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-background animate-pulse"></div>
            {post.referenceImageBase64 && (
              <div className="absolute inset-0 z-0 opacity-20 blur-md">
                <img src={`data:image/png;base64,${post.referenceImageBase64}`} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-muted-foreground/20 border-t-foreground rounded-full animate-spin"></div>
                <VeoLogo className="w-5 h-5 text-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-foreground mb-1 animate-pulse">Генерация</p>
                <p className="text-xs text-muted-foreground line-clamp-2 px-2 max-w-[200px] mx-auto">"{post.description}"</p>
              </div>
            </div>
          </div>
        );

      case PostStatus.ERROR:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 p-6 text-center">
            <AlertCircle className="w-10 h-10 text-destructive mb-3 opacity-80" />
            <p className="text-sm font-bold uppercase tracking-widest text-foreground mb-1">Ошибка</p>
            <p className="text-xs text-destructive line-clamp-3 px-2">{post.errorMessage || "Произошла ошибка."}</p>
          </div>
        );

      case PostStatus.SUCCESS:
      default:
        return post.videoUrl ? (
          <video
            ref={videoRef}
            src={post.videoUrl}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            preload="metadata"
          />
        ) : null;
    }
  };

  return (
    <div
      className="relative w-full h-full rounded-3xl overflow-hidden bg-card border border-border aspect-[9/16] group shadow-xl flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderContent()}

      {status === PostStatus.SUCCESS && (
        <div className="absolute top-3 left-3 z-20 bg-primary px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
        </div>
      )}

      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background/30 border border-border backdrop-blur-xl px-2 py-1 rounded-full text-xs font-medium text-foreground/90 z-20">
        <VeoLogo className="w-3 h-3 opacity-80" />
        {post.modelTag}
      </div>

      <div className={`absolute bottom-0 left-0 w-full p-4 flex items-end justify-between z-20 pt-16 bg-gradient-to-t from-background via-background/50 to-transparent transition-opacity duration-300 ${status !== PostStatus.SUCCESS ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex-1 mr-4 pointer-events-none">
          <p className="text-sm text-foreground line-clamp-2 font-light leading-snug">{post.description}</p>
        </div>

        {status === PostStatus.SUCCESS && (
          <button 
            onClick={handleDownload}
            className="p-2.5 rounded-full bg-card/50 border border-border backdrop-blur-xl hover:bg-card transition-all text-foreground shadow-lg hover:scale-105"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const MainPanel: React.FC = () => {
  const { feed, setFeed, updateFeedPost, setErrorToast, setShowApiKeyDialog, avatars } = useApp();
  const [prompt, setPrompt] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState<CameoProfile | null>(null);
  const [avatarImageFile, setAvatarImageFile] = useState<ImageFile | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle through example prompts
  React.useEffect(() => {
    if (prompt !== '') return;
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % examplePrompts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [prompt]);

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
        setErrorToast('Неверный API ключ. Проверьте настройки.');
      }
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

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

    let mode = GenerationMode.TEXT_TO_VIDEO;
    let referenceImages: ImageFile[] | undefined = undefined;
    let selectedModel = VeoModel.VEO_FAST;
    let currentAspectRatio = AspectRatio.PORTRAIT;

    if (avatarImageFile) {
      mode = GenerationMode.REFERENCES_TO_VIDEO;
      selectedModel = VeoModel.VEO;
      currentAspectRatio = AspectRatio.LANDSCAPE;
      referenceImages = [avatarImageFile];
    }

    const newPostId = Date.now().toString();
    const newPost: FeedPost = {
      id: newPostId,
      username: 'вы',
      avatarUrl: selectedAvatar?.imageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
      description: prompt,
      modelTag: selectedModel === 'veo-3.1-fast-generate-preview' ? 'Veo Fast' : 'Veo',
      status: PostStatus.GENERATING,
      referenceImageBase64: avatarImageFile?.base64,
    };

    setFeed(prev => [newPost, ...prev]);
    
    const params: GenerateVideoParams = {
      prompt,
      model: selectedModel,
      aspectRatio: currentAspectRatio,
      resolution: Resolution.P720,
      mode,
      referenceImages,
    };

    processGeneration(newPostId, params);
    setPrompt('');
    setSelectedAvatar(null);
    setAvatarImageFile(null);
    
    if (inputRef.current) {
      inputRef.current.style.height = '28px';
    }
  }, [prompt, avatarImageFile, selectedAvatar, setFeed, setShowApiKeyDialog, setErrorToast, updateFeedPost]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const imgFile = await fileToImageFile(file);
        const url = URL.createObjectURL(file);
        const newAvatar: CameoProfile = {
          id: `temp-${Date.now()}`,
          name: 'Вы',
          imageUrl: url,
        };
        setSelectedAvatar(newAvatar);
        setAvatarImageFile(imgFile);
      } catch (error) {
        console.error('Error uploading file', error);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="h-full relative overflow-y-auto overflow-x-hidden no-scrollbar bg-background">
      {/* Ambient light */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_hsl(var(--primary)/0.08),_transparent_60%)]" />

      {/* Video Grid */}
      <div className="w-full max-w-6xl mx-auto p-4 pb-40 pt-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {feed.map((post) => (
            <VideoCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Bottom Prompt Bar */}
      <div className="fixed bottom-12 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
        <div className="w-full max-w-xl bg-card/95 border border-border backdrop-blur-2xl shadow-2xl overflow-hidden pointer-events-auto rounded-2xl">
          <div className="flex items-end gap-3 p-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0 ${
                selectedAvatar 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
              }`}
            >
              {selectedAvatar ? (
                <img src={selectedAvatar.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </button>
            
            <div className="flex-grow relative py-1">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={examplePrompts[promptIndex]}
                className="w-full bg-transparent text-foreground outline-none resize-none overflow-hidden py-1 leading-relaxed text-base font-light placeholder:text-muted-foreground/60"
                style={{ height: '28px' }}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0 ${
                prompt.trim()
                  ? 'bg-foreground text-background hover:scale-105'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;
