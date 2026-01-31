/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { FeedPost, PostStatus } from '../types';
import { VeoLogo } from './icons';
import { AlertTriangle, Download, Sparkles, Play, Trash2, ExternalLink, ShieldAlert, CreditCard, Scissors, Key, UserPlus, Share2 } from 'lucide-react';

interface VideoCardProps {
    post: FeedPost;
    onDelete?: () => void;
    onClick?: () => void;
    onEdit?: () => void;
    onOpenKeySelector?: () => void;
    onAddToCameo?: (base64: string) => void;
    onShare?: () => void;
    isFullscreen?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ post, onDelete, onClick, onEdit, onOpenKeySelector, onAddToCameo, onShare, isFullscreen = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const status = post.status ?? PostStatus.SUCCESS;
  const isBillingError = post.errorMessage?.toLowerCase().includes('quota') || post.errorMessage?.includes('429') || post.errorMessage?.toLowerCase().includes('billing');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || status !== PostStatus.SUCCESS) return;
    const shouldPlay = isFullscreen || isHovered;

    if (shouldPlay) {
        if (video.paused) {
            playPromiseRef.current = video.play();
            playPromiseRef.current
                .then(() => { setIsPlaying(true); playPromiseRef.current = null; })
                .catch(() => { setIsPlaying(false); });
        }
    } else {
        if (playPromiseRef.current) {
            playPromiseRef.current.then(() => { video.pause(); setIsPlaying(false); }).catch(() => {});
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }
  }, [isHovered, status, isFullscreen]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.videoUrl || status !== PostStatus.SUCCESS) return;
    try {
        const link = document.createElement('a');
        link.href = post.videoUrl;
        link.download = `cameo-${post.id}.mp4`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) { console.error("Download failed:", error); }
  };

  const handleSaveCameo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToCameo) return;

    if (post.referenceImageBase64) {
        onAddToCameo(post.referenceImageBase64);
        return;
    }

    if (videoRef.current) {
        try {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                try {
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    const base64 = dataUrl.split(',')[1];
                    onAddToCameo(base64);
                } catch (securityError) {
                    console.error("Security error capturing frame (CORS):", securityError);
                    alert("Не удалось сохранить кадр из-за ограничений безопасности (CORS).");
                }
            }
        } catch (err) {
            console.error("Failed to capture frame for cameo", err);
        }
    }
  };

  const renderContent = () => {
    switch (status) {
      case PostStatus.GENERATING:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-neutral-900" role="status" aria-label="Создание видео...">
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center"><VeoLogo className="w-4 h-4 text-indigo-500" /></div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 animate-pulse">Generating</p>
            </div>
          </div>
        );
      case PostStatus.ERROR:
        return (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#080808] p-4 text-center" role="status" aria-label="Ошибка создания видео">
            {isBillingError ? (
                <>
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
                        Оплата
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4 max-w-[200px]">
                        Проверьте биллинг в Google Cloud Console.
                    </p>
                    <div className="flex flex-col gap-2 w-full max-w-[160px]">
                        <a 
                            href="https://console.cloud.google.com/billing" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Настроить
                        </a>
                        {onOpenKeySelector && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onOpenKeySelector(); }}
                                className="px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-colors active:scale-95"
                            >
                                Сменить ключ
                            </button>
                        )}
                         <button 
                            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }}
                            className="mt-1 text-[9px] font-bold text-red-400 hover:text-red-500 uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                        >
                            Удалить
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-3 text-red-500 ring-1 ring-red-500/20">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">
                        Ошибка
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4 max-w-[200px] line-clamp-3">
                        {post.errorMessage || "Что-то пошло не так при создании видео."}
                    </p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors active:scale-95"
                    >
                        <Trash2 className="w-3 h-3" />
                        Удалить
                    </button>
                </>
            )}
          </div>
        );
      case PostStatus.SUCCESS:
        return (
          <div className="w-full h-full relative bg-black">
            <video
              ref={videoRef}
              src={post.videoUrl}
              crossOrigin="anonymous"
              onLoadedData={() => setVideoLoaded(true)}
              className={`w-full h-full transition-transform duration-700 ${isFullscreen ? 'object-contain' : 'object-cover group-hover:scale-110'}`}
              loop muted playsInline
              aria-label={post.description}
            />
            {!isFullscreen && !isPlaying && videoLoaded && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm p-3 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" aria-hidden="true" />
                </div>
            )}
            {!isFullscreen && (
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-[10px] font-semibold line-clamp-2 text-shadow-sm">{post.description}</p>
                </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  const wrapperClass = isFullscreen 
    ? "relative w-full h-full flex items-center justify-center overflow-hidden" 
    : "relative w-full aspect-[9/16] md:aspect-square overflow-hidden bg-slate-100 dark:bg-neutral-900 group cursor-pointer border border-white/5 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 z-0 hover:z-10";

  return (
    <motion.div 
      layoutId={post.id} 
      className={wrapperClass} 
      onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      whileHover={!isFullscreen ? { scale: 1.015, y: -2 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      role="article"
      aria-label={`Видео пост от ${post.username}`}
    >
      {!isFullscreen && status === PostStatus.SUCCESS && !post.id.startsWith('s') && (
        <div className="absolute top-2 left-2 z-20 bg-indigo-500/90 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg backdrop-blur-md">
            <Sparkles className="w-2 h-2" aria-hidden="true" /> New
        </div>
      )}

      {/* Add to Cameos button for feed view */}
      {!isFullscreen && status === PostStatus.SUCCESS && onAddToCameo && (
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
             <button 
                onClick={handleSaveCameo}
                className="w-8 h-8 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-indigo-600 transition-colors hover:scale-105 active:scale-95 shadow-lg"
                title="Сохранить как Cameo"
            >
                <UserPlus className="w-4 h-4" />
            </button>
        </div>
      )}
      
      {renderContent()}

      {isFullscreen && status === PostStatus.SUCCESS && (
        <div className="absolute bottom-0 inset-x-0 p-6 pt-32 bg-gradient-to-t from-black via-black/60 to-transparent flex items-end justify-between z-30 pointer-events-none">
            <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white/80 border border-white/10 flex items-center gap-1">
                        <VeoLogo className="w-3 h-3" aria-hidden="true" /> {post.modelTag}
                    </div>
                </div>
                <p className="text-white/95 font-light text-lg leading-snug drop-shadow-md">{post.description}</p>
            </div>
            <div className="flex flex-col gap-3 pointer-events-auto">
                 {onAddToCameo && (
                    <button onClick={handleSaveCameo} aria-label="Сохранить персонажа" className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-indigo-600 hover:text-white transition-colors focus:ring-2 focus:ring-indigo-500 outline-none group">
                        <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    </button>
                 )}
                 {onEdit && (
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} aria-label="Редактировать видео" className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors focus:ring-2 focus:ring-indigo-500 outline-none">
                        <Scissors className="w-5 h-5" aria-hidden="true" />
                    </button>
                 )}
                 {onShare && (
                     <button onClick={(e) => { e.stopPropagation(); onShare(); }} aria-label="Поделиться" className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors focus:ring-2 focus:ring-indigo-500 outline-none">
                        <Share2 className="w-5 h-5" aria-hidden="true" />
                     </button>
                 )}
                 <button onClick={handleDownload} aria-label="Скачать видео" className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors focus:ring-2 focus:ring-indigo-500 outline-none">
                    <Download className="w-5 h-5" aria-hidden="true" />
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }} aria-label="Удалить видео" className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:bg-red-500/20 hover:text-red-400 focus:ring-2 focus:ring-red-500 outline-none">
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                 </button>
            </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoCard;