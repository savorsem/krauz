/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Play, Pause, RotateCcw, Loader2, Wand2, Scissors, Layers, Film, Plus, Trash2, ArrowUp, ArrowDown, Upload, GripVertical } from 'lucide-react';

interface VideoEditorProps {
  videoUrl: string;
  onSave: (blob: Blob) => void;
  onClose: () => void;
}

interface VideoClip {
  id: string;
  url: string;
  name: string;
  duration: number;
}

const FILTERS = [
  { name: 'Original', value: 'none', class: '' },
  { name: 'Cinema', value: 'contrast(110%) saturate(110%) sepia(20%)', class: 'contrast-125 saturate-125 sepia-25' },
  { name: 'Noir', value: 'grayscale(100%) contrast(120%)', class: 'grayscale contrast-125' },
  { name: 'Warm', value: 'sepia(50%) contrast(105%)', class: 'sepia-50 contrast-105' },
  { name: 'Vivid', value: 'saturate(200%)', class: 'saturate-200' },
  { name: 'Cyber', value: 'hue-rotate(190deg) contrast(120%)', class: 'hue-rotate-180 contrast-125' },
];

export const VideoEditor: React.FC<VideoEditorProps> = ({ videoUrl, onSave, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'trim' | 'filter' | 'merge'>('filter');
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10); 
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [hoveredClip, setHoveredClip] = useState<{ id: string; url: string; rect: DOMRect } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trap focus
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    setClips([{ id: 'initial-' + Date.now(), url: videoUrl, name: 'Main Video', duration: 0 }]);
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const dur = video.duration;
      setDuration(dur);
      if (endTime === 10 || endTime > dur || endTime === 0) setEndTime(dur);
      if (clips.length > 0 && video.src === clips[0].url) {
         setClips(prev => {
             const newClips = [...prev];
             if(newClips[0]) newClips[0].duration = dur;
             return newClips;
         });
      }
    };

    const handleTimeUpdate = () => {
      if (!isProcessing && activeTab !== 'merge') {
        if (activeTab === 'trim') {
             if (video.currentTime < startTime - 0.5) video.currentTime = startTime;
             if (video.currentTime >= endTime) {
                video.currentTime = startTime;
                if (isPlaying) video.play().catch(() => {}); 
             }
        }
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [endTime, startTime, isProcessing, isPlaying, activeTab, clips]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else {
          if (activeTab === 'trim' && (videoRef.current.currentTime >= endTime || videoRef.current.currentTime < startTime)) {
              videoRef.current.currentTime = startTime;
          }
          videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (val < endTime) {
          setStartTime(val);
          if (videoRef.current) {
              videoRef.current.currentTime = val;
              videoRef.current.pause();
              setIsPlaying(false);
          }
      }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (val > startTime) {
          setEndTime(val);
          if (videoRef.current) {
              videoRef.current.currentTime = val;
              videoRef.current.pause();
              setIsPlaying(false);
          }
      }
  };

  const handleAddClip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
        const url = URL.createObjectURL(file);
        const tempVideo = document.createElement('video');
        tempVideo.onloadedmetadata = () => {
             setClips(prev => [...prev, { id: `clip-${Date.now()}`, url, name: file.name, duration: tempVideo.duration }]);
        };
        tempVideo.src = url;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
    setHoveredClip(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    setClips(prev => {
        const newClips = [...prev];
        const [movedItem] = newClips.splice(draggedItemIndex, 1);
        newClips.splice(index, 0, movedItem);
        return newClips;
    });
    setDraggedItemIndex(null);
  };

  const handleClipMouseEnter = (e: React.MouseEvent, clip: VideoClip) => {
    if (draggedItemIndex !== null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredClip({ id: clip.id, url: clip.url, rect });
  };

  const handleClipMouseLeave = () => {
    setHoveredClip(null);
  };

  const handleProcess = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setIsPlaying(false);
    video.pause();
    
    canvas.width = video.videoWidth || 1080; 
    canvas.height = video.videoHeight || 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasStream = canvas.captureStream(30);
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();
    const sourceNode = audioCtx.createMediaElementSource(video);
    sourceNode.connect(dest);
    sourceNode.connect(audioCtx.destination); 
    
    const finalStream = new MediaStream([...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
    const recorder = new MediaRecorder(finalStream, { mimeType, videoBitsPerSecond: 5000000 });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        onSave(blob);
        setIsProcessing(false);
        if (!video.src.includes(videoUrl) && !videoUrl.includes('blob')) video.src = videoUrl; 
        sourceNode.disconnect();
        audioCtx.close();
    };

    recorder.start();
    const drawFrame = () => {
        if (recorder.state === 'inactive') return;
        ctx.filter = selectedFilter.value;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
    };
    drawFrame();

    try {
        if (activeTab === 'merge') {
            const totalDuration = clips.reduce((acc, clip) => acc + (clip.duration || 0), 0);
            let accumulatedTime = 0;

            for (const clip of clips) {
                if (recorder.state === 'inactive') break;
                video.src = clip.url;
                await new Promise((r) => video.onloadedmetadata = () => r(true));

                const updateMergeProgress = () => {
                    const currentTotal = accumulatedTime + video.currentTime;
                    const pct = totalDuration > 0 ? (currentTotal / totalDuration) * 100 : 0;
                    setProcessingProgress(Math.min(99, pct));
                };
                video.addEventListener('timeupdate', updateMergeProgress);

                await video.play();
                await new Promise((r) => {
                    const checkEnd = () => { 
                        if (video.ended) { 
                            video.removeEventListener('ended', checkEnd); 
                            video.removeEventListener('timeupdate', updateMergeProgress);
                            r(true); 
                        } 
                    };
                    video.addEventListener('ended', checkEnd);
                });
                accumulatedTime += clip.duration;
            }
        } else {
            const totalClipDuration = endTime - startTime;
            if (!video.src.includes(videoUrl) && !videoUrl.includes('blob')) video.src = videoUrl; 
            if (video.readyState < 2) await new Promise(r => video.onloadeddata = r);
            
            const updateTrimProgress = () => {
                 const current = Math.max(0, video.currentTime - startTime);
                 const pct = totalClipDuration > 0 ? (current / totalClipDuration) * 100 : 0;
                 setProcessingProgress(Math.min(99, pct));
            };
            video.addEventListener('timeupdate', updateTrimProgress);

            video.currentTime = startTime;
            await video.play();
            await new Promise((r) => {
                const checkTime = () => { 
                    if (video.currentTime >= endTime || video.ended) { 
                        video.removeEventListener('timeupdate', checkTime); 
                        video.removeEventListener('timeupdate', updateTrimProgress);
                        r(true); 
                    } 
                };
                video.addEventListener('timeupdate', checkTime);
            });
        }
        setProcessingProgress(100);
    } catch (e) { console.error(e); } finally { recorder.stop(); video.pause(); }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[90] bg-black/95 flex flex-col items-center justify-center p-4 outline-none safe-area-pb"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-editor-title"
      tabIndex={-1}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-auto md:max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <h3 id="video-editor-title" className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-500" aria-hidden="true" /> Редактор
            </h3>
            <button 
              onClick={onClose} 
              disabled={isProcessing} 
              aria-label="Закрыть редактор"
              className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors focus:ring-2 focus:ring-indigo-500"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="relative flex-1 bg-black min-h-[200px] flex items-center justify-center overflow-hidden group">
            <video 
                ref={videoRef}
                src={videoUrl}
                crossOrigin="anonymous" 
                className="max-h-full max-w-full object-contain"
                style={{ filter: selectedFilter.value }}
                playsInline
                aria-label="Превью видео"
            />
            {!isPlaying && !isProcessing && (
                <button 
                  onClick={togglePlay} 
                  aria-label="Воспроизвести"
                  className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"
                >
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                        <Play className="w-6 h-6 text-white fill-white ml-1" aria-hidden="true" />
                    </div>
                </button>
            )}
            {isProcessing && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20" role="alert" aria-busy="true">
                    <div className="relative w-16 h-16 mb-4">
                        <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                            <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path 
                                className="text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeDasharray={`${processingProgress}, 100`} 
                                strokeWidth="3" 
                                style={{ transition: 'stroke-dasharray 0.1s linear' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">{Math.round(processingProgress)}%</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/80 animate-pulse">
                        {activeTab === 'merge' ? 'Склеивание...' : 'Рендеринг...'}
                    </span>
                    <span className="text-[10px] text-white/40 mt-2">Не закрывайте окно</span>
                </div>
            )}
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </div>

        <div className="bg-[#111] p-4 border-t border-white/10">
            <div className="flex gap-2 mb-6" role="tablist">
                <button 
                  role="tab"
                  aria-selected={activeTab === 'filter'}
                  onClick={() => setActiveTab('filter')} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'filter' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                    <Wand2 className="w-3.5 h-3.5" aria-hidden="true" /> Фильтры
                </button>
                <button 
                  role="tab"
                  aria-selected={activeTab === 'trim'}
                  onClick={() => setActiveTab('trim')} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'trim' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                    <Scissors className="w-3.5 h-3.5" aria-hidden="true" /> Обрезка
                </button>
                <button 
                  role="tab"
                  aria-selected={activeTab === 'merge'}
                  onClick={() => setActiveTab('merge')} 
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'merge' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                    <Layers className="w-3.5 h-3.5" aria-hidden="true" /> Слияние
                </button>
            </div>

            <div className="h-32">
                {activeTab === 'filter' && (
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2" role="group" aria-label="Список фильтров">
                        {FILTERS.map((f) => (
                            <button 
                                key={f.name}
                                onClick={() => setSelectedFilter(f)}
                                aria-label={`Применить фильтр ${f.name}`}
                                className={`shrink-0 flex flex-col items-center gap-2 group outline-none`}
                            >
                                <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedFilter.name === f.name ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60 group-hover:opacity-100'}`}>
                                    <div className={`w-full h-full bg-slate-800 ${f.class}`} style={f.value !== 'none' && !f.class ? {filter: f.value} : {}}>
                                        <div className="w-full h-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20" aria-hidden="true"></div>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-bold uppercase ${selectedFilter.name === f.name ? 'text-indigo-400' : 'text-white/40'}`}>{f.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {activeTab === 'trim' && (
                    <div className="px-2 pt-2" role="group" aria-label="Обрезка видео">
                        <div className="flex justify-between text-[10px] text-white/40 mb-2 font-mono">
                            <span>{startTime.toFixed(1)}s</span>
                            <span className="text-indigo-400 font-bold" aria-live="polite">Duration: {(endTime - startTime).toFixed(1)}s</span>
                            <span>{endTime.toFixed(1)}s</span>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1 space-y-1">
                                <label className="text-[9px] uppercase font-bold text-white/30" htmlFor="start-range">Start</label>
                                <input 
                                    id="start-range"
                                    type="range" 
                                    min={0} max={duration} step={0.1}
                                    value={startTime}
                                    onChange={handleStartChange}
                                    aria-valuemin={0} aria-valuemax={duration} aria-valuenow={startTime}
                                    className="w-full h-1 bg-white/20 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                                />
                            </div>
                             <div className="flex-1 space-y-1">
                                <label className="text-[9px] uppercase font-bold text-white/30" htmlFor="end-range">End</label>
                                <input 
                                    id="end-range"
                                    type="range" 
                                    min={0} max={duration} step={0.1}
                                    value={endTime}
                                    onChange={handleEndChange}
                                    aria-valuemin={0} aria-valuemax={duration} aria-valuenow={endTime}
                                    className="w-full h-1 bg-white/20 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'merge' && (
                    <div className="h-full flex gap-4">
                        <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-y-auto no-scrollbar p-2 space-y-2" role="list" aria-label="Список клипов">
                             {clips.map((clip, idx) => (
                                 <div 
                                    key={clip.id} 
                                    draggable
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(idx)}
                                    onMouseEnter={(e) => handleClipMouseEnter(e, clip)}
                                    onMouseLeave={handleClipMouseLeave}
                                    className={`flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5 group transition-all ${draggedItemIndex === idx ? 'opacity-30 border-dashed border-white/30' : 'hover:bg-white/5'}`} 
                                    role="listitem"
                                 >
                                     <div className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 p-1">
                                        <GripVertical className="w-4 h-4" />
                                     </div>
                                     <div className="w-6 h-6 bg-indigo-500/10 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]" aria-hidden="true">
                                         {idx + 1}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <p className="text-[11px] font-medium text-white/90 truncate">{clip.name}</p>
                                         <p className="text-[9px] text-white/40 font-mono">{clip.duration ? clip.duration.toFixed(1) : '?'}s</p>
                                     </div>
                                     <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => setClips(prev => { const n = [...prev]; if(idx>0){[n[idx],n[idx-1]]=[n[idx-1],n[idx]]} return n; })} disabled={idx === 0} aria-label="Вверх" className="p-1 hover:bg-white/10 rounded text-white/40 disabled:opacity-20"><ArrowUp className="w-3 h-3" /></button>
                                         <button onClick={() => setClips(prev => { const n = [...prev]; if(idx<n.length-1){[n[idx],n[idx+1]]=[n[idx+1],n[idx]]} return n; })} disabled={idx === clips.length - 1} aria-label="Вниз" className="p-1 hover:bg-white/10 rounded text-white/40 disabled:opacity-20"><ArrowDown className="w-3 h-3" /></button>
                                         <div className="w-px h-3 bg-white/10 mx-1 self-center"></div>
                                         <button onClick={() => setClips(prev => prev.filter((_,i)=>i!==idx))} aria-label="Удалить клип" className="p-1 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                                     </div>
                                 </div>
                             ))}
                        </div>
                        <div className="w-24 flex flex-col gap-2">
                            <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleAddClip} />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                aria-label="Добавить видео клип"
                                className="flex-1 border border-dashed border-white/20 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-2 text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all focus:ring-2 focus:ring-indigo-500"
                            >
                                <Plus className="w-6 h-6" aria-hidden="true" />
                                <span className="text-[9px] uppercase font-bold text-center">Add Clip</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <button 
                  onClick={() => { setStartTime(0); setEndTime(duration); setSelectedFilter(FILTERS[0]); setClips([{ id: 'init', url: videoUrl, name: 'Main Video', duration }]); }} 
                  className="text-xs font-bold text-white/40 hover:text-white flex items-center gap-1.5 transition-colors focus:ring-1 focus:ring-white/20"
                >
                    <RotateCcw className="w-3 h-3" /> Сброс
                </button>
                <button 
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 focus:ring-2 focus:ring-indigo-300"
                >
                   {isProcessing ? 'Рендеринг...' : 'Сохранить'} <Check className="w-4 h-4" />
                </button>
            </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {hoveredClip && draggedItemIndex === null && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed z-[100] pointer-events-none bg-black rounded-xl border border-white/20 shadow-2xl overflow-hidden ring-4 ring-black/20"
                style={{
                    top: Math.max(10, hoveredClip.rect.top - 100),
                    left: Math.min(window.innerWidth - 170, hoveredClip.rect.left + (hoveredClip.rect.width / 2) - 80),
                    width: '160px',
                    aspectRatio: '16/9'
                }}
            >
                <video 
                    src={hoveredClip.url} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-white/90 truncate">Preview</span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};