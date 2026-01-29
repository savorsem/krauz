/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState, useEffect } from 'react';
import { AspectRatio, CameoProfile, GenerateVideoParams, GenerationMode, ImageFile, Resolution, VeoModel } from '../types';
import { ArrowUp, Plus, User, Upload, Check, X, Smartphone, Monitor, Zap, Sparkles, SlidersHorizontal, Lock, Image as ImageIcon, Clapperboard, Wand2, Camera } from 'lucide-react';
import { saveToDB, getAllFromDB, deleteFromDB, STORES_CONST } from '../utils/db';

const defaultCameoProfiles: CameoProfile[] = [];

const examplePrompts = [
  "Пишу код на заснеженной вершине...",
  "Прыгаю с парашютом над океаном...",
  "На красной ковровой дорожке...",
  "Управляю космическим кораблем...",
  "Играю диджей-сет на фестивале...",
  "Нахожу древний храм...",
  "Пью кофе в Париже...",
  "Катаюсь на серфе на закате...",
  "Играю соло на гитаре...",
];

const urlToImageFile = async (url: string): Promise<ImageFile | null> => {
  try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ 
            file: new File([blob], 'cameo.png', { type: blob.type }), 
            base64: (reader.result as string).split(',')[1] 
        });
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
  } catch (e) {
      console.warn("Failed to load image from URL:", url);
      return null;
  }
};

const fileToImageFile = (file: File): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ 
          file, 
          base64: (reader.result as string).split(',')[1] 
      });
      reader.readAsDataURL(file);
    });
};

interface BottomPromptBarProps {
  onGenerate: (params: GenerateVideoParams) => void;
}

const BottomPromptBar: React.FC<BottomPromptBarProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  
  // Modes: 'text' = Standard Text-to-Video, 'cameo' = Subject Reference
  const [mode, setMode] = useState<'text' | 'cameo'>('text');
  
  const [selectedCameoIds, setSelectedCameoIds] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Settings
  const [selectedModel, setSelectedModel] = useState<VeoModel>(VeoModel.VEO_FAST);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [selectedResolution, setSelectedResolution] = useState<Resolution>(Resolution.P720);

  const [profiles, setProfiles] = useState<CameoProfile[]>(defaultCameoProfiles);
  const [profileImages, setProfileImages] = useState<Record<string, ImageFile>>({});
  const [promptIndex, setPromptIndex] = useState(0);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Derived Constraints
  // Cameo mode forces the Pro model for better adherence
  const effectiveModel = mode === 'cameo' ? VeoModel.VEO : selectedModel;
  const effectiveAspectRatio = selectedAspectRatio; // Allow ratio choice in both, but could lock if needed
  const effectiveResolution = selectedResolution;

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const stored = await getAllFromDB<CameoProfile>(STORES_CONST.PROFILES);
        setProfiles(stored.reverse());
        // Pre-cache images
        for (const p of stored) {
           if (!profileImages[p.id]) {
                if (p.imageUrl.startsWith('data:')) {
                    fetch(p.imageUrl).then(res => res.blob()).then(blob => {
                         const file = new File([blob], 'stored.png', { type: blob.type });
                         setProfileImages(prev => ({...prev, [p.id]: { file, base64: p.imageUrl.split(',')[1] }}));
                    }).catch(err => console.error("Failed to restore image from DB blob", err));
                }
           }
        }
      } catch (e) { console.error("Profile load error", e); }
    };
    loadProfiles();
  }, []);

  useEffect(() => {
    if (prompt !== '') return;
    const interval = setInterval(() => setPromptIndex((p) => (p + 1) % examplePrompts.length), 3500);
    return () => clearInterval(interval);
  }, [prompt]);

  // Camera Logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (showCamera) {
      const initCamera = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (e) {
            console.error("Camera access failed", e);
            alert("Не удалось получить доступ к камере.");
            setShowCamera(false);
        }
      };
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera]);

  const handleCameraCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Match dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64 = dataUrl.split(',')[1];
        
        // Convert to blob/file
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
                const imgFile: ImageFile = { file, base64 };
                
                // Create new profile
                const newId = `user-${Date.now()}`;
                const newProfile = { id: newId, name: 'Снимок', imageUrl: `data:image/jpeg;base64,${base64}` };
                
                setProfiles(prev => [newProfile, ...prev]);
                setProfileImages(prev => ({ ...prev, [newId]: imgFile }));
                
                // Select it automatically
                if (mode !== 'cameo') setMode('cameo');
                setSelectedCameoIds(prev => prev.length < 3 ? [...prev, newId] : prev);
                
                saveToDB(STORES_CONST.PROFILES, newProfile);
                if (!isExpanded) setIsExpanded(true);
                
                setShowCamera(false);
            });
    }
  };

  // Handler to switch modes
  const handleModeSwitch = (newMode: 'text' | 'cameo') => {
    setMode(newMode);
    if (newMode === 'cameo') {
      // Auto-select first profile if none selected when switching to Cameo
      if (selectedCameoIds.length === 0 && profiles.length > 0) {
        setSelectedCameoIds([profiles[0].id]);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const imgFile = await fileToImageFile(file);
        const newId = `user-${Date.now()}`;
        const newProfile = { id: newId, name: 'Вы', imageUrl: `data:${file.type};base64,${imgFile.base64}` };
        
        setProfiles(prev => [newProfile, ...prev]);
        setProfileImages(prev => ({ ...prev, [newId]: imgFile }));
        
        // If uploading, likely wants to use it immediately
        setMode('cameo');
        setSelectedCameoIds(prev => prev.length < 3 ? [...prev, newId] : prev);
        
        saveToDB(STORES_CONST.PROFILES, newProfile);
        
        if (!isExpanded) setIsExpanded(true);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCameoSelect = (id: string) => {
    setSelectedCameoIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : (prev.length >= 3 ? prev : [...prev, id]));
  };

  const handleDeleteProfile = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProfiles(prev => prev.filter(p => p.id !== id));
    setSelectedCameoIds(prev => prev.filter(pId => pId !== id));
    await deleteFromDB(STORES_CONST.PROFILES, id);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    let generationMode = GenerationMode.TEXT_TO_VIDEO;
    let referenceImages: ImageFile[] | undefined = undefined;

    if (mode === 'cameo') {
      generationMode = GenerationMode.REFERENCES_TO_VIDEO;
      
      if (selectedCameoIds.length === 0) {
        alert("Выберите хотя бы одного персонажа для Cameo.");
        return;
      }

      try {
          const imgs = await Promise.all(selectedCameoIds.map(async (id) => {
              const p = profiles.find(c => c.id === id);
              if (!p) return null;
              
              if (profileImages[p.id]) return profileImages[p.id];
              return await urlToImageFile(p.imageUrl);
          }));
          
          const validImgs = imgs.filter(Boolean) as ImageFile[];
          if (validImgs.length === 0) {
              alert("Не удалось загрузить выбранные изображения.");
              return;
          }
          referenceImages = validImgs;
      } catch (e) { console.error(e); return; }
    }

    onGenerate({ 
        prompt, 
        model: effectiveModel, 
        aspectRatio: effectiveAspectRatio, 
        resolution: effectiveResolution, 
        mode: generationMode, 
        referenceImages 
    });
    
    setPrompt('');
    if (inputRef.current) inputRef.current.style.height = '24px';
  };

  // Helper UI Components
  const SettingBtn = ({ active, onClick, icon: Icon, label, disabled }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border ${
        active
          ? 'bg-slate-900 text-white border-transparent dark:bg-white dark:text-black shadow-md'
          : 'bg-transparent text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {disabled && active && <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-indigo-500 bg-white dark:bg-black rounded-full p-0.5 box-content border border-indigo-500 z-10" />}
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </button>
  );

  return (
    <>
    {/* Camera Modal */}
    <AnimatePresence>
        {showCamera && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black flex flex-col pointer-events-auto"
            >
                <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                    {/* Mirroring preview for selfie feel */}
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    
                    <button onClick={() => setShowCamera(false)} className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center z-10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="h-32 bg-black flex items-center justify-center pb-[env(safe-area-inset-bottom)] relative">
                    <button 
                    onClick={handleCameraCapture}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform"
                    >
                        <div className="w-full h-full bg-white rounded-full"></div>
                    </button>
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
            </motion.div>
        )}
    </AnimatePresence>

    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pb-[env(safe-area-inset-bottom)] mb-4">
      <motion.div
        ref={barRef}
        initial={false}
        animate={{ height: 'auto' }}
        className="w-full max-w-lg bg-white/85 dark:bg-[#111]/85 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] rounded-[28px] pointer-events-auto overflow-hidden ring-1 ring-black/5 dark:ring-white/5 transition-all duration-500"
      >
        {/* Hidden File Input (Always Mounted) */}
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

        {/* Expanded Content Area */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-0"
            >
              {/* Tab Switcher */}
              <div className="flex p-2 gap-1">
                <button 
                  onClick={() => handleModeSwitch('text')}
                  className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 ${mode === 'text' ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <Clapperboard className="w-4 h-4" />
                  Text to Video
                </button>
                <button 
                  onClick={() => handleModeSwitch('cameo')}
                  className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 ${mode === 'cameo' ? 'bg-indigo-600 text-white shadow-indigo-500/30 shadow-md' : 'text-slate-400 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <Wand2 className="w-4 h-4" />
                  Cameo Mode
                </button>
              </div>

              {/* Avatar Selector - Only Visible in Cameo Mode */}
              <AnimatePresence mode="wait">
                {mode === 'cameo' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 pb-2">
                        <div className="bg-slate-50/50 dark:bg-white/5 rounded-2xl p-2 border border-black/5 dark:border-white/5">
                            <div className="flex items-center justify-between mb-2 px-2 text-slate-500 dark:text-white/60">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                    <User className="w-3 h-3" />
                                    <span>Выберите героя ({selectedCameoIds.length}/3)</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 overflow-x-auto no-scrollbar items-center px-1 pb-1">
                            <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 shrink-0 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white/50 dark:bg-white/5 text-slate-400 flex items-center justify-center transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group" title="Загрузить фото">
                                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform text-current dark:text-white/50" />
                            </button>
                            <button onClick={() => setShowCamera(true)} className="w-12 h-12 shrink-0 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white/50 dark:bg-white/5 text-slate-400 flex items-center justify-center transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group" title="Сделать фото">
                                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform text-current dark:text-white/50" />
                            </button>
                            
                            {(profiles.length > 0 || selectedCameoIds.length > 0) && <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1 shrink-0" />}
                            {profiles.length === 0 && <span className="text-[10px] text-slate-400 dark:text-white/30 italic px-2">Добавьте фото...</span>}

                            {profiles.map((p) => {
                                const isSel = selectedCameoIds.includes(p.id);
                                return (
                                    <button key={p.id} onClick={() => handleCameoSelect(p.id)} className={`relative w-12 h-12 shrink-0 rounded-xl transition-all duration-300 group ${isSel ? 'ring-2 ring-indigo-500 dark:ring-white scale-105 z-10' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}>
                                    <img src={p.imageUrl} alt="" className="w-full h-full object-cover rounded-xl bg-black/20" />
                                    {isSel && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-black"><Check className="w-2.5 h-2.5" /></div>}
                                    {!isSel && <div onClick={(e) => handleDeleteProfile(e, p.id)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-125 transition-all shadow-sm"><X className="w-2.5 h-2.5" /></div>}
                                    </button>
                                );
                            })}
                            </div>
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Advanced Settings */}
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-2 pb-2 overflow-hidden">
                    <div className="bg-slate-50/50 dark:bg-white/5 rounded-2xl p-3 border border-black/5 dark:border-white/5 flex flex-col gap-3">
                        {mode === 'cameo' && (
                            <div className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5 px-1">
                                <Sparkles className="w-3 h-3" />
                                Настройки оптимизированы для Cameo
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2 justify-between">
                            <div className="flex gap-1.5">
                                <SettingBtn active={effectiveModel === VeoModel.VEO_FAST} onClick={() => setSelectedModel(VeoModel.VEO_FAST)} icon={Zap} label="Fast" disabled={mode === 'cameo'} />
                                <SettingBtn active={effectiveModel === VeoModel.VEO} onClick={() => setSelectedModel(VeoModel.VEO)} icon={Sparkles} label="Pro" disabled={mode === 'cameo'} />
                            </div>
                            <div className="w-px h-5 bg-black/10 dark:bg-white/10 self-center" />
                            <div className="flex gap-1.5">
                                <SettingBtn active={effectiveAspectRatio === AspectRatio.PORTRAIT} onClick={() => setSelectedAspectRatio(AspectRatio.PORTRAIT)} icon={Smartphone} label="9:16" />
                                <SettingBtn active={effectiveAspectRatio === AspectRatio.LANDSCAPE} onClick={() => setSelectedAspectRatio(AspectRatio.LANDSCAPE)} icon={Monitor} label="16:9" />
                            </div>
                            <div className="w-px h-5 bg-black/10 dark:bg-white/10 self-center" />
                             <div className="flex gap-1.5">
                                <SettingBtn active={effectiveResolution === Resolution.P720} onClick={() => setSelectedResolution(Resolution.P720)} label="720p" />
                                <SettingBtn active={effectiveResolution === Resolution.P1080} onClick={() => setSelectedResolution(Resolution.P1080)} label="1080p" />
                            </div>
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar */}
        <div className="flex items-end gap-2 p-2 pt-0">
          <div className="flex flex-col gap-1">
             <button onClick={() => { if(!isExpanded) { setIsExpanded(true); setTimeout(() => setSettingsOpen(true), 100); } else { setSettingsOpen(!settingsOpen); } }}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 border ${settingsOpen ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent' : 'text-slate-400 dark:text-white/40 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsExpanded(!isExpanded); if(!isExpanded) setTimeout(() => inputRef.current?.focus(), 100); }}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${isExpanded ? 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/20 rotate-45' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105'}`}>
                <Plus className="w-5 h-5" />
              </button>
          </div>
          
          <div className={`flex-grow relative flex items-center min-h-[44px] rounded-[20px] pl-3 pr-4 border transition-all gap-2 ${mode === 'cameo' ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500/20 focus-within:border-indigo-500/50' : 'bg-slate-100 dark:bg-white/5 border-transparent focus-within:border-indigo-500/30 focus-within:bg-white dark:focus-within:bg-black/20'}`}>
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 p-1.5 rounded-lg text-slate-400 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-white transition-colors"
                title="Загрузить фото"
            >
                <ImageIcon className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              {prompt === '' && (
                <motion.div key={examplePrompts[promptIndex]} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute inset-y-0 left-12 right-12 flex items-center pointer-events-none">
                  <span className="text-slate-400 dark:text-white/30 text-sm truncate flex-grow">{examplePrompts[promptIndex]}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`; }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } else if (e.key === 'Tab' && !prompt) { e.preventDefault(); setPrompt(examplePrompts[promptIndex]); } }}
              rows={1}
              className="w-full bg-transparent text-slate-900 dark:text-white outline-none resize-none py-2.5 text-sm font-medium placeholder-transparent no-scrollbar"
              style={{ height: '24px', minHeight: '24px' }}
            />
            {prompt === '' && <div onClick={() => setPrompt(examplePrompts[promptIndex])} className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 text-[9px] font-mono text-slate-400 dark:text-white/40 cursor-pointer hover:bg-white dark:hover:bg-white/10">TAB</div>}
          </div>

          <div className="flex items-center gap-2 shrink-0 h-[44px]">
             <AnimatePresence>
                {mode === 'cameo' && selectedCameoIds.length > 0 && (
                    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex -space-x-2 pl-2">
                        {selectedCameoIds.slice(0, 2).map((id) => {
                             const p = profiles.find(pr => pr.id === id);
                             return p ? <img key={id} src={p.imageUrl} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#111] object-cover" /> : null;
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
            <button onClick={handleSubmit} disabled={!prompt.trim()} className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 ${prompt.trim() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-110' : 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-white/20 cursor-not-allowed'}`}>
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default BottomPromptBar;