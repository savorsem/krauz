/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState, useEffect } from 'react';
import { FeedPost, PostStatus } from '../types';
import { VeoLogo } from './icons';
import { AlertTriangle, Download, Sparkles, Play, Trash2, ExternalLink, ShieldAlert, CreditCard } from 'lucide-react';

interface VideoCardProps {
    post: FeedPost;
    onDelete?: () => void;
    onClick?: () => void;
    isFullscreen?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ post, onDelete, onClick, isFullscreen = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const status = post.status ?? PostStatus.SUCCESS;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || status !== PostStatus.SUCCESS) return;

    const shouldPlay = isFullscreen || isHovered;

    if (shouldPlay) {
        // Attempt to play
        if (video.paused) {
            playPromiseRef.current = video.play();
            playPromiseRef.current
                .then(() => {
                    setIsPlaying(true);
                    playPromiseRef.current = null;
                })
                .catch((e) => {
                    // Auto-play was prevented or interrupted, this is normal behavior
                    if (e.name !== 'AbortError') console.debug("Video play interrupted", e);
                    setIsPlaying(false);
                });
        }
    } else {
        // Pause safely
        if (playPromiseRef.current) {
            playPromiseRef.current.then(() => {
                video.pause();
                if (!isFullscreen) video.currentTime = 0;
                setIsPlaying(false);
            }).catch(() => {});
        } else {
            video.pause();
            if (!isFullscreen) video.currentTime = 0;
            setIsPlaying(false);
        }
    }
  }, [isHovered, status, isFullscreen]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.videoUrl || status !== PostStatus.SUCCESS) return;
    try {
        const link = document.createElement('a');
        if (post.videoUrl.startsWith('http') && !post.videoUrl.startsWith('blob')) {
             // For remote URLs, we fetch as blob to force download instead of open
             const response = await fetch(post.videoUrl);
             const blob = await response.blob();
             link.href = window.URL.createObjectURL(blob);
        } else {
             link.href = post.videoUrl;
        }
        link.download = `cameo-${post.id}.mp4`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) { console.error("Download failed:", error); }
  };

  const renderContent = () => {
    switch (status) {
      case PostStatus.GENERATING:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-neutral-900">
            {post.referenceImageBase64 && (
              <div className="absolute inset-0 opacity-20 blur-xl">
                <img src={`data:image/png;base64,${post.referenceImageBase64}`} className="w-full h-full object-cover" alt="preview" />
              </div>
            )}
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
        const msg = post.errorMessage || "Unknown error";
        const isBilling = msg.includes('API_KEY') || msg.includes('billing');
        const isSafety = msg.includes('safety') || msg.includes('blocked');
        
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/50 dark:bg-[#1a0505] p-4 text-center group/err">
            <div className={`p-3 rounded-full mb-3 shadow-inner ${isBilling ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                {isBilling ? <CreditCard className="w-6 h-6" /> : (isSafety ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />)}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{isBilling ? 'Access Denied' : (isSafety ? 'Safety Block' : 'Failed')}</p>
            <p className="text-[11px] opacity-60 line-clamp-3 leading-tight max-w-[200px] mb-2">{msg}</p>
            
            {isBilling && (
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full">
                    CHECK BILLING <ExternalLink className="w-3 h-3"/>
                </a>
            )}
            
            {isFullscreen && (
                <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }} className="mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors flex items-center gap-2 text-xs font-medium">
                    <Trash2 className="w-3.5 h-3.5" /> Удалить
                </button>
            )}
          </div>
        );
      case PostStatus.SUCCESS:
        return (
          <div className="w-full h-full relative bg-black">
            <video
              ref={videoRef}
              src={post.videoUrl}
              onLoadedData={() => setVideoLoaded(true)}
              className={`w-full h-full transition-transform duration-700 ${isFullscreen ? 'object-contain' : 'object-cover group-hover:scale-105'}`}
              loop muted playsInline
            />
            {/* Poster / Thumbnail fallback */}
            {!videoLoaded && post.referenceImageBase64 && (
              <div className="absolute inset-0 pointer-events-none"><img src={`data:image/png;base64,${post.referenceImageBase64}`} className={`w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'}`} alt="thumbnail" /></div>
            )}
            {/* Play Button Indicator */}
            {!isFullscreen && !isPlaying && videoLoaded && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm p-3 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  const wrapperClass = isFullscreen 
    ? "relative w-full h-full flex items-center justify-center overflow-hidden" 
    : "relative w-full aspect-[9/16] md:aspect-square overflow-hidden bg-slate-100 dark:bg-neutral-900 group cursor-pointer border border-white/5";

  return (
    <motion.div layoutId={post.id} className={wrapperClass} onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {!isFullscreen && status === PostStatus.SUCCESS && !post.id.startsWith('s') && (
        <div className="absolute top-2 left-2 z-20 bg-indigo-500/90 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-indigo-500/20 backdrop-blur-md">
            <Sparkles className="w-2 h-2" /> New
        </div>
      )}
      
      {renderContent()}

      {isFullscreen && status === PostStatus.SUCCESS && (
        <div className="absolute bottom-0 inset-x-0 p-6 pt-32 bg-gradient-to-t from-black via-black/60 to-transparent flex items-end justify-between z-30 pointer-events-none">
            <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white/80 border border-white/10 flex items-center gap-1">
                        <VeoLogo className="w-3 h-3" /> {post.modelTag}
                    </div>
                </div>
                <p className="text-white/95 font-light text-lg leading-snug drop-shadow-md">{post.description}</p>
            </div>
            <div className="flex flex-col gap-3 pointer-events-auto">
                 <button onClick={handleDownload} title="Download" className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors shadow-lg active:scale-95"><Download className="w-5 h-5" /></button>
                 <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }} title="Delete" className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors shadow-lg active:scale-95"><Trash2 className="w-5 h-5" /></button>
            </div>
        </div>
      )}
      
      {!isFullscreen && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-medium text-white/90 border border-white/10 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            {post.modelTag}
          </div>
      )}
    </motion.div>
  );
};

export default VideoCard;