/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { AspectRatio, CameoProfile, GenerateVideoParams, GenerationMode, ImageFile, Resolution, VeoModel, CameoImage } from '../types';
import { ArrowUp, Plus, User, Upload, Check, X, Smartphone, Monitor, Zap, Sparkles, SlidersHorizontal, Lock, Image as ImageIcon, Clapperboard, Wand2, Camera, UserPlus, Info, Trash2, RefreshCw } from 'lucide-react';
import { saveToDB, getAllFromDB, deleteFromDB, STORES_CONST } from '../utils/db';

interface BottomPromptBarProps {
  onGenerate: (params: GenerateVideoParams) => void;
  defaultModel?: VeoModel;
  profiles: CameoProfile[];
  onProfilesChange: () => void;
}

const SettingBtn = ({ active, onClick, icon: Icon, label, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border ${
      active ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/30 scale-105' : 'bg-transparent text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 hover:scale-105'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {label}
  </button>
);

const BottomPromptBar: React.FC<BottomPromptBarProps> = ({ onGenerate, defaultModel = VeoModel.VEO_FAST, profiles, onProfilesChange }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'text' | 'cameo'>('text');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const [selectedModel, setSelectedModel] = useState<VeoModel>(defaultModel);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [selectedResolution, setSelectedResolution] = useState<Resolution>(Resolution.P720);

  const [promptIndex, setPromptIndex] = useState(0);

  const [showCamera, setShowCamera] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [targetProfileId, setTargetProfileId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const examplePrompts = ["Пишу код на заснеженной вершине...", "Прыгаю с парашютом над океаном...", "На красной ковровой дорожке...", "Управляю космическим кораблем...", "Играю диджей-сет на фестивале...", "Нахожу древний храм...", "Пью кофе в Париже...", "Катаюсь на серфе на закате..."];

  useEffect(() => {
    setSelectedModel(defaultModel);
  }, [defaultModel]);

  useEffect(() => {
    if (prompt !== '') return;
    const interval = setInterval(() => setPromptIndex((p) => (p + 1) % examplePrompts.length), 3500);
    return () => clearInterval(interval);
  }, [prompt]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (showCamera && !capturedImage) {
      const initCamera = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } }, audio: false });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) { 
            console.error("Camera access denied", e);
            setShowCamera(false); 
        }
      };
      initCamera();
    }
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [showCamera, capturedImage]);

  const addImageToProfile = async (profileId: string | null, newImage: CameoImage) => {
        let updatedProfile: CameoProfile;

        if (profileId) {
            const existing = profiles.find(p => p.id === profileId);
            if (!existing) return;
            updatedProfile = { ...existing, images: [...existing.images, newImage] };
        } else {
            const newId = `char-${Date.now()}`;
            updatedProfile = { id: newId, name: 'Герой', images: [newImage] };
            setSelectedProfileId(newId);
        }

        await saveToDB(STORES_CONST.PROFILES, updatedProfile);
        onProfilesChange();
  };

  const handleCameraCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, size, size);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64 = dataUrl.split(',')[1];
        const newImg: CameoImage = { id: `img-${Date.now()}`, url: dataUrl, base64 };

        if (targetProfileId) {
           addImageToProfile(targetProfileId, newImg);
            if (mode !== 'cameo') setMode('cameo');
            setTimeout(() => setShowCamera(false), 300);
        } else {
            setCapturedImage(dataUrl);
        }
    }
  };

  const handleAssignToProfile = async (profileId: string) => {
    if (!capturedImage) return;
    const base64 = capturedImage.split(',')[1];
    const newImg: CameoImage = { id: `img-${Date.now()}`, url: capturedImage, base64 };
    await addImageToProfile(profileId, newImg);

    setCapturedImage(null);
    setShowCamera(false);
    setMode('cameo');
    setSelectedProfileId(profileId);
  };

  const handleCreateNewProfile = async () => {
    if (!capturedImage) return;
    const name = window.prompt("Имя персонажа:", "Новый Герой");
    if (name) {
        const base64 = capturedImage.split(',')[1];
        const newImg: CameoImage = { id: `img-${Date.now()}`, url: capturedImage, base64 };

        const newId = `char-${Date.now()}`;
        const newProfile = { id: newId, name, images: [newImg] };

        await saveToDB(STORES_CONST.PROFILES, newProfile);
        onProfilesChange();
        setSelectedProfileId(newId);

        setCapturedImage(null);
        setShowCamera(false);
        setMode('cameo');
    }
  };

  const handleRetake = () => {
      setCapturedImage(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readFile = (file: File): Promise<CameoImage> => {
        return new Promise((resolve, reject) => {
            // Ensure file is actually a File/Blob instance
            if (!(file instanceof File) && !(file instanceof Blob)) {
                reject(new Error('Invalid file type'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const url = reader.result as string;
                resolve({
                    id: `img-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,
                    url: url,
                    base64: url.split(',')[1]
                });
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    };

    if (files.length > 0) {
        const newImages: CameoImage[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if(file instanceof File && file.type.startsWith('image/')) {
                newImages.push(await readFile(file));
            }
        }

        if (newImages.length === 0) return;

        if (targetProfileId) {
             const existing = profiles.find(p => p.id === targetProfileId);
             if (existing) {
                const updatedProfile = { ...existing, images: [...existing.images, ...newImages] };
                await saveToDB(STORES_CONST.PROFILES, updatedProfile);
                onProfilesChange();
                setMode('cameo');
                setSelectedProfileId(targetProfileId);
             }
             setTargetProfileId(null);
        } else {
            const name = window.prompt(newImages.length > 1 ? `Имя персонажа (${newImages.length} фото):` : "Имя персонажа:", "Новый Герой");
            if (name) {
                const newId = `char-${Date.now()}`;
                const newProfile = { id: newId, name, images: newImages };
                await saveToDB(STORES_CONST.PROFILES, newProfile);
                onProfilesChange();
                setSelectedProfileId(newId);
                setMode('cameo');
            }
        }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteProfile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить этого персонажа?')) {
        await deleteFromDB(STORES_CONST.PROFILES, id);
        onProfilesChange();
        if (selectedProfileId === id) setSelectedProfileId(null);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    let referenceImages: ImageFile[] | undefined = undefined;
    if (mode === 'cameo' && selectedProfileId) {
        const profile = profiles.find(p => p.id === selectedProfileId);
        if (profile) {
            const latestImages = profile.images.slice(-3);
            referenceImages = latestImages.map(img => ({
                file: new File([], `${img.id}.jpg`, { type: 'image/jpeg' }),
                base64: img.base64
            }));
        }
    }

    onGenerate({ 
        prompt, 
        model: mode === 'cameo' ? VeoModel.VEO : selectedModel, 
        aspectRatio: selectedAspectRatio, 
        resolution: selectedResolution, 
        mode: mode === 'cameo' ? GenerationMode.REFERENCES_TO_VIDEO : GenerationMode.TEXT_TO_VIDEO,
        referenceImages
    });
    setPrompt('');
  };

  return (
    <>
    <AnimatePresence>
        {showCamera && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-black flex flex-col">
                {capturedImage ? (
                    <div className="relative flex-1 bg-black overflow-hidden flex flex-col">
                        <img src={capturedImage} className="flex-1 object-contain bg-black" alt="Captured" />

                        <div className="absolute top-6 left-6 z-20">
                            <button onClick={handleRetake} className="w-12 h-12 glass-strong border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="absolute top-6 right-6 z-20">
                            <button onClick={() => { setShowCamera(false); setCapturedImage(null); }} className="w-12 h-12 glass-strong border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="glass-strong border-t border-white/10 p-4 pb-12 safe-area-pb">
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] text-center mb-4">Назначить фото</p>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar justify-center min-h-[90px] px-4">
                                <button onClick={handleCreateNewProfile} className="flex flex-col items-center gap-2 group shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50">
                                        <Plus className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Создать</span>
                                </button>

                                {profiles.length > 0 && <div className="w-px h-16 bg-white/10 mx-1 shrink-0"></div>}

                                {profiles.map(p => (
                                    <button key={p.id} onClick={() => handleAssignToProfile(p.id)} className="flex flex-col items-center gap-2 group shrink-0">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-indigo-500 transition-all relative hover:scale-110 shadow-lg">
                                            <img src={p.images[p.images.length-1].url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                                        </div>
                                        <span className="text-[10px] text-white/60 group-hover:text-white font-bold max-w-[64px] truncate transition-colors">{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {isFlashing && <div className="absolute inset-0 bg-white z-[110]" />}
                        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                            <div className="absolute inset-0 pointer-events-none opacity-20"><div className="w-full h-full grid grid-cols-3 grid-rows-3"><div className="border-r border-b border-white"></div><div className="border-r border-b border-white"></div><div className="border-b border-white"></div><div className="border-r border-b border-white"></div><div className="border-r border-b border-white"></div><div className="border-b border-white"></div><div className="border-r border-white"></div><div className="border-r border-white"></div></div></div>
                            <button onClick={() => { setShowCamera(false); setCapturedImage(null); }} className="absolute top-6 right-6 w-10 h-10 glass-strong text-white rounded-full flex items-center justify-center hover-lift"><X /></button>
                            <div className="absolute bottom-10 left-0 right-0 px-10 text-center"><p className="text-white/60 text-xs uppercase tracking-widest font-bold glass inline-block py-2 rounded-full px-4">
                                {targetProfileId ? 'Добавьте новый ракурс' : 'Сфотографируйте героя'}
                            </p></div>
                        </div>
                        <div className="h-32 bg-black flex items-center justify-center pb-8 safe-area-pb"><button onClick={handleCameraCapture} className="w-20 h-20 rounded-full border-[6px] border-white/20 p-1 active:scale-90 transition-transform"><div className="w-full h-full bg-white rounded-full"></div></button></div>
                        <canvas ref={canvasRef} className="hidden" />
                    </>
                )}
            </motion.div>
        )}
    </AnimatePresence>

    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] mb-4 pointer-events-none">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl glass-strong border border-slate-200 dark:border-white/10 shadow-2xl rounded-[32px] pointer-events-auto overflow-hidden"
      >
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col">
              {/* Mode Selector */}
              <div className="flex p-2 gap-1 bg-slate-100/80 dark:bg-white/5 mx-2 mt-2 rounded-2xl backdrop-blur-xl">
                <button onClick={() => setMode('text')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-white dark:bg-neutral-800 shadow-md text-slate-900 dark:text-white scale-105' : 'text-slate-500 dark:text-white/40 hover:bg-white/50 dark:hover:bg-white/5'}`}>
                  <Clapperboard className="w-4 h-4" /> Text
                </button>
                <button onClick={() => setMode('cameo')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${mode === 'cameo' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 scale-105' : 'text-slate-500 dark:text-white/40 hover:bg-white/50 dark:hover:bg-white/5'}`}>
                  <Wand2 className="w-4 h-4" /> Cameo
                </button>
              </div>

              {mode === 'cameo' && (
                <div className="pb-2 animate-slide-down">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar items-center px-4 pb-4 pt-4 min-h-[110px]">
                        {/* New Avatar Actions */}
                        <div className="flex gap-2 shrink-0">
                            <button 
                                onClick={() => { setTargetProfileId(null); setShowCamera(true); }}
                                className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 flex flex-col items-center justify-center gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-500 transition-all group active:scale-95 hover-lift"
                                title="Сделать фото"
                            >
                                <div className="w-7 h-7 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Camera className="w-3.5 h-3.5 text-slate-400 dark:text-white/60 group-hover:text-indigo-500" />
                                </div>
                                <span className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/40">Camera</span>
                            </button>

                            <button 
                                onClick={() => { setTargetProfileId(null); fileInputRef.current?.click(); }}
                                className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 flex flex-col items-center justify-center gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-500 transition-all group active:scale-95 hover-lift"
                                title="Загрузить фото"
                            >
                                <div className="w-7 h-7 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Upload className="w-3.5 h-3.5 text-slate-400 dark:text-white/60 group-hover:text-indigo-500" />
                                </div>
                                <span className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/40">Upload</span>
                            </button>
                        </div>

                        {profiles.length > 0 && <div className="w-px h-10 bg-slate-200 dark:bg-white/10 shrink-0"></div>}

                        {/* Profiles List */}
                        <AnimatePresence initial={false}>
                            {profiles.map((p) => {
                                const isSelected = selectedProfileId === p.id;
                                return (
                                    <motion.div 
                                        key={p.id}
                                        layoutId={`profile-${p.id}`}
                                        className="relative shrink-0 flex flex-col items-center"
                                    >
                                        <button 
                                            onClick={() => setSelectedProfileId(p.id)}
                                            className={`relative w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-[#0a0a0a] shadow-xl scale-105 z-10' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0 scale-95 hover:scale-100 hover-lift'}`}
                                        >
                                            {p.images[p.images.length-1] ? (
                                                <img src={p.images[p.images.length-1].url} className="w-full h-full object-cover" alt={p.name} />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">{p.name[0]}</div>
                                            )}

                                            {!isSelected && p.images.length > 1 && (
                                                <div className="absolute top-1 right-1 glass text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                                    {p.images.length}
                                                </div>
                                            )}

                                            {isSelected && (
                                                <div className="absolute inset-0 ring-2 ring-inset ring-white/20">
                                                    <div className="absolute top-1 right-1 bg-indigo-500 text-white rounded-full p-0.5 shadow-sm">
                                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>

                                        {/* Action buttons popup */}
                                        {isSelected && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -5 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute -bottom-9 flex gap-1 glass-strong shadow-lg rounded-full p-1 border border-slate-100 dark:border-white/10 z-20"
                                            >
                                                <button onClick={(e) => { e.stopPropagation(); setTargetProfileId(p.id); setShowCamera(true); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 hover:text-indigo-500 transition-colors" title="Добавить фото">
                                                    <Camera className="w-3 h-3" />
                                                </button>
                                                <div className="w-px bg-slate-200 dark:bg-white/10 my-1"></div>
                                                <button onClick={(e) => { e.stopPropagation(); setTargetProfileId(p.id); fileInputRef.current?.click(); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 hover:text-indigo-500 transition-colors" title="Загрузить ещё фото">
                                                    <Upload className="w-3 h-3" />
                                                </button>
                                                <div className="w-px bg-slate-200 dark:bg-white/10 my-1"></div>
                                                <button onClick={(e) => handleDeleteProfile(p.id, e)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-slate-500 hover:text-red-500 transition-colors" title="Удалить">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
              )}

              {/* Settings Panel */}
              {settingsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-3 pb-3"
                >
                  <div className="glass border border-slate-200 dark:border-white/10 p-3 rounded-2xl flex flex-col gap-3">
                    <div className="flex gap-2">
                        <SettingBtn active={selectedModel === VeoModel.VEO_FAST} onClick={() => setSelectedModel(VeoModel.VEO_FAST)} icon={Zap} label="Fast" />
                        <SettingBtn active={selectedModel === VeoModel.VEO} onClick={() => setSelectedModel(VeoModel.VEO)} icon={Sparkles} label="Pro" />
                    </div>
                    <div className="flex gap-2">
                        <SettingBtn active={selectedAspectRatio === AspectRatio.PORTRAIT} onClick={() => setSelectedAspectRatio(AspectRatio.PORTRAIT)} icon={Smartphone} label="9:16" />
                        <SettingBtn active={selectedAspectRatio === AspectRatio.LANDSCAPE} onClick={() => setSelectedAspectRatio(AspectRatio.LANDSCAPE)} icon={Monitor} label="16:9" />
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Area */}
        <div className="flex items-end gap-2 p-3">
          <button onClick={() => setSettingsOpen(!settingsOpen)} className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all border hover-lift ${settingsOpen ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-lg scale-105' : 'text-slate-400 dark:text-white/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 hover:scale-105'}`}>
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          <button 
            onClick={() => { setTargetProfileId(null); setShowCamera(true); }}
            className="w-11 h-11 flex items-center justify-center rounded-2xl transition-all border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover-lift"
            title="Сделать фото"
          >
            <Camera className="w-5 h-5" />
          </button>

          <div className="flex-grow relative bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-indigo-500/30 transition-all flex items-center px-4 hover-glow">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder={mode === 'cameo' ? (selectedProfileId ? "Что делает этот герой?" : "Сначала выберите героя") : examplePrompts[promptIndex]}
              className="w-full bg-transparent text-slate-900 dark:text-white outline-none resize-none py-3 text-sm font-semibold min-h-[48px] max-h-[120px] placeholder:text-slate-400 dark:placeholder:text-white/30 leading-relaxed"
              rows={1}
              style={{
                height: 'auto',
                maxHeight: '120px',
                overflow: 'auto'
              }}
            />
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={!prompt.trim() || (mode === 'cameo' && !selectedProfileId)} 
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${prompt.trim() && (mode === 'text' || selectedProfileId) ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 active:scale-90 hover:shadow-indigo-500/50 hover:scale-110' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20 cursor-not-allowed'}`}
          >
            <ArrowUp className={`w-5 h-5 transition-transform ${prompt.trim() ? 'scale-110' : ''}`} />
          </button>
        </div>

        {/* Info Badge */}
        {mode === 'cameo' && !selectedProfileId && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 pb-3"
          >
            <div className="glass border border-indigo-500/20 p-2 rounded-xl flex items-center gap-2 text-[10px] text-indigo-600 dark:text-indigo-400">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold">Выберите героя выше или создайте нового</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
    </>
  );
};

export default BottomPromptBar;
