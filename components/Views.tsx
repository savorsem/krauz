/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Film, Users, Settings, Puzzle, ArrowLeft, CheckSquare, Plus, Check, Trash2, X, UserPlus, Loader2, Moon, Zap, Sparkles, Key, HardDrive, Database, ChevronRight, Share2, AlertCircle, Workflow, MessageSquare, GripHorizontal } from 'lucide-react';
import { FeedPost, PostStatus, CameoProfile, CameoImage, VeoModel, IntegrationConfig, IntegrationType, AppView } from '../types';
import { saveToDB, deleteFromDB, STORES_CONST } from '../utils/db';

export const Header = ({ title, icon: Icon, action }: any) => (
    <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-50/90 dark:bg-[#050505]/90 backdrop-blur-xl z-30 py-4 -mx-4 px-4 border-b border-transparent transition-all">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide flex items-center gap-3 text-slate-900 dark:text-white">
            {Icon && <Icon className="w-6 h-6 text-indigo-500" />} {title}
        </h2>
        {action}
    </div>
);

export const HistoryView = ({ feed }: { feed: FeedPost[] }) => (
  <div className="w-full max-w-3xl mx-auto p-4 md:p-8 pb-32">
      <Header title="История" icon={Clock} />
      
      {feed.filter(p => !p.id.startsWith('s')).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-40">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">История пуста</p>
          </div>
      ) : (
          <div className="grid gap-4">
            {feed.filter(p => !p.id.startsWith('s')).map(post => (
                <div key={post.id} className="bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-2xl p-4 flex gap-4 items-center group hover:border-indigo-500/30 transition-all">
                    <div className="w-20 h-20 bg-black rounded-xl overflow-hidden shrink-0 relative shadow-inner">
                        {post.referenceImageBase64 ? (
                            <img src={`data:image/jpeg;base64,${post.referenceImageBase64}`} className="w-full h-full object-cover" />
                        ) : post.videoUrl ? (
                            <video src={post.videoUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center"><Film className="w-6 h-6 opacity-50" /></div>
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-slate-400 dark:text-white/40">{new Date(Number(post.id)).toLocaleDateString()}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${post.status === PostStatus.ERROR ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                {post.status?.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white/90 line-clamp-2 leading-relaxed">{post.description}</p>
                    </div>
                </div>
            ))}
          </div>
      )}
  </div>
);

interface AvatarsViewProps {
  profiles: CameoProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<CameoProfile[]>>;
  setCurrentView: (view: AppView) => void;
}

export const AvatarsView: React.FC<AvatarsViewProps> = ({ profiles, setProfiles, setCurrentView }) => {
    const [viewingProfile, setViewingProfile] = useState<CameoProfile | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Create/Edit Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCharName, setNewCharName] = useState('');
    const [newCharImages, setNewCharImages] = useState<CameoImage[]>([]);

    // Selection State
    const [isImageSelectionMode, setIsImageSelectionMode] = useState(false);
    const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
    const [isProfileSelectionMode, setIsProfileSelectionMode] = useState(false);
    const [selectedProfileIds, setSelectedProfileIds] = useState<Set<string>>(new Set());

    // Drag and Drop State
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const createFileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = async (files: File[]): Promise<CameoImage[]> => {
        setIsProcessing(true);
        const images: CameoImage[] = [];
        try {
            await Promise.all(files.map(async (file) => {
                if (!file.type.startsWith('image/')) return;
                return new Promise<void>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const url = reader.result as string;
                        images.push({
                            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            url,
                            base64: url.split(',')[1]
                        });
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            }));
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
        return images;
    };

    const updateProfile = async (updatedProfile: CameoProfile) => {
        setViewingProfile(updatedProfile);
        setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
        await saveToDB(STORES_CONST.PROFILES, updatedProfile);
    };

    const handleCreateSubmit = async () => {
        if (!newCharName.trim()) {
            alert("Пожалуйста, введите имя персонажа");
            return;
        }
        if (newCharImages.length === 0) {
            alert("Добавьте хотя бы одно фото");
            return;
        }

        const newProfile: CameoProfile = {
            id: `char-${Date.now()}`,
            name: newCharName.trim(),
            images: newCharImages
        };

        await saveToDB(STORES_CONST.PROFILES, newProfile);
        setProfiles(prev => [newProfile, ...prev]);
        setNewCharName('');
        setNewCharImages([]);
        setShowCreateModal(false);
    };

    const deleteProfile = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if(confirm('Удалить этого персонажа и все данные?')) {
            await deleteFromDB(STORES_CONST.PROFILES, id);
            setProfiles(prev => prev.filter(p => p.id !== id));
            if (viewingProfile?.id === id) setViewingProfile(null);
        }
    }

    const deleteSelectedProfiles = async () => {
        if (selectedProfileIds.size === 0) return;
        if (!confirm(`Удалить выбранных персонажей (${selectedProfileIds.size})?`)) return;

        for (const id of selectedProfileIds) {
            await deleteFromDB(STORES_CONST.PROFILES, id);
        }
        setProfiles(prev => prev.filter(p => !selectedProfileIds.has(p.id)));
        setSelectedProfileIds(new Set());
        setIsProfileSelectionMode(false);
    };

    const deleteImage = async (profileId: string, imgId: string) => {
        if (!confirm('Удалить это фото?')) return;
        if (!viewingProfile) return;
        const updatedProfile = { 
            ...viewingProfile, 
            images: viewingProfile.images.filter(i => i.id !== imgId) 
        };
        await updateProfile(updatedProfile);
    };

    const deleteSelectedImages = async () => {
        if (!viewingProfile) return;
        if (!confirm(`Удалить выбранные фото (${selectedImageIds.size})?`)) return;
        
        const updatedProfile = {
            ...viewingProfile,
            images: viewingProfile.images.filter(i => !selectedImageIds.has(i.id))
        };
        
        await updateProfile(updatedProfile);
        setSelectedImageIds(new Set());
        setIsImageSelectionMode(false);
    };

    const handleAddPhotoToExisting = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!viewingProfile || !e.target.files) return;
        const files = Array.from(e.target.files) as File[];
        const newImages = await processFiles(files);
        if (newImages.length > 0) {
            const updatedProfile = { ...viewingProfile, images: [...viewingProfile.images, ...newImages] };
            await updateProfile(updatedProfile);
        }
        e.target.value = '';
    };

    const handleCreateModalFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files) as File[];
        const processed = await processFiles(files);
        setNewCharImages(prev => [...prev, ...processed]);
        e.target.value = '';
    }

    // Drag and Drop Handlers
    const handleImageDragStart = (e: React.DragEvent, index: number) => {
        setDraggedImageIndex(index);
        e.dataTransfer.effectAllowed = "move";
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };
    
    const handleImageDragEnd = (e: React.DragEvent) => {
        setDraggedImageIndex(null);
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
    };

    const handleImageDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleImageDrop = async (index: number) => {
        if (draggedImageIndex === null || !viewingProfile) return;
        if (draggedImageIndex !== index) {
            const newImages = [...viewingProfile.images];
            const [movedItem] = newImages.splice(draggedImageIndex, 1);
            newImages.splice(index, 0, movedItem);

            const updatedProfile = { ...viewingProfile, images: newImages };
            await updateProfile(updatedProfile);
        }
        setDraggedImageIndex(null);
    };

    if (viewingProfile) {
        return (
          <div className="w-full max-w-3xl mx-auto p-4 md:p-8 pb-32">
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-50/90 dark:bg-[#050505]/90 backdrop-blur-xl z-30 py-4 -mx-4 px-4 border-b border-transparent">
                  <div className="flex items-center gap-4">
                      <button onClick={() => { setViewingProfile(null); setIsImageSelectionMode(false); setSelectedImageIds(new Set()); }} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                          <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                          <h2 className="text-xl font-black uppercase tracking-wide flex items-center gap-2 text-white">
                              {viewingProfile.name}
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-white/60">{viewingProfile.images.length} фото</p>
                      </div>
                  </div>
                  <div className="flex gap-2">
                       {isImageSelectionMode ? (
                           <>
                              <button onClick={() => { setIsImageSelectionMode(false); setSelectedImageIds(new Set()); }} className="text-xs font-bold text-white/60 px-3 py-2 hover:text-white transition-colors">Отмена</button>
                              <button 
                                  onClick={deleteSelectedImages} 
                                  disabled={selectedImageIds.size === 0}
                                  className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-50 transition-colors"
                              >
                                  Удалить ({selectedImageIds.size})
                              </button>
                           </>
                       ) : (
                           <button onClick={() => setIsImageSelectionMode(true)} className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Выбрать фото">
                               <CheckSquare className="w-5 h-5" />
                           </button>
                       )}
                  </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <input type="file" ref={fileInputRef} onChange={handleAddPhotoToExisting} accept="image/*" className="hidden" multiple />
                  
                  {!isImageSelectionMode && (
                      <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                          className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-indigo-500/50 hover:text-indigo-400 transition-all text-slate-400 dark:text-white/40 disabled:opacity-50"
                      >
                          {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" />}
                          <span className="text-[10px] font-bold uppercase">{isProcessing ? 'Загрузка...' : 'Добавить'}</span>
                      </button>
                  )}

                  <AnimatePresence>
                      {viewingProfile.images.map((img, idx) => (
                          <motion.div 
                              layout={!isImageSelectionMode}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              key={img.id}
                              draggable={!isImageSelectionMode}
                              onDragStart={(e) => handleImageDragStart(e as unknown as React.DragEvent, idx)}
                              onDragEnd={(e) => handleImageDragEnd(e as unknown as React.DragEvent)}
                              onDragOver={(e) => handleImageDragOver(e as unknown as React.DragEvent)}
                              onDrop={() => handleImageDrop(idx)}
                              onClick={() => { if (isImageSelectionMode) { const newSet = new Set(selectedImageIds); if (newSet.has(img.id)) newSet.delete(img.id); else newSet.add(img.id); setSelectedImageIds(newSet); }}}
                              className={`relative aspect-[3/4] rounded-2xl overflow-hidden border transition-all group bg-neutral-900 ${
                                  isImageSelectionMode && selectedImageIds.has(img.id) 
                                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-95 opacity-100' 
                                      : 'border-transparent opacity-100'
                              } ${!isImageSelectionMode ? 'cursor-grab active:cursor-grabbing hover:z-10 hover:shadow-xl' : 'cursor-pointer'}`}
                          >
                              <img src={img.url} className="w-full h-full object-cover pointer-events-none" />
                              
                              {!isImageSelectionMode && (
                                <div className="absolute top-2 left-2 p-1 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-white/60 pointer-events-none backdrop-blur-sm">
                                    <GripHorizontal className="w-4 h-4" />
                                </div>
                              )}

                              {isImageSelectionMode && (
                                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border border-white/40 flex items-center justify-center transition-colors ${selectedImageIds.has(img.id) ? 'bg-indigo-500 border-indigo-500' : 'bg-black/40'}`}>
                                      {selectedImageIds.has(img.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                  </div>
                              )}

                              {!isImageSelectionMode && (
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button onClick={(e) => { e.stopPropagation(); deleteImage(viewingProfile.id, img.id); }} className="p-2.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors backdrop-blur-md">
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              )}
                          </motion.div>
                      ))}
                  </AnimatePresence>
              </div>

              <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/10">
                  {!isImageSelectionMode && (
                      <button onClick={() => deleteProfile(viewingProfile.id)} className="w-full py-4 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors">
                          <Trash2 className="w-4 h-4" /> Удалить персонажа
                      </button>
                  )}
              </div>
          </div>
        );
    }

    return (
      <div className="w-full max-w-3xl mx-auto p-4 md:p-8 pb-32">
          {showCreateModal && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><UserPlus className="w-5 h-5 text-indigo-500" /> Новый персонаж</h3>
                        <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-white/40 mb-1.5 block">Имя</label>
                            <input 
                                type="text" 
                                value={newCharName}
                                onChange={(e) => setNewCharName(e.target.value)}
                                placeholder="Например: Нео"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none text-sm font-medium"
                                autoFocus
                            />
                        </div>

                        <div>
                             <label className="text-[10px] font-bold uppercase text-white/40 mb-1.5 block">Фотографии ({newCharImages.length})</label>
                             <div className="grid grid-cols-4 gap-2">
                                 {newCharImages.map((img, idx) => (
                                     <div key={idx} className="aspect-square relative rounded-lg overflow-hidden group bg-white/5">
                                         <img src={img.url} className="w-full h-full object-cover" />
                                         <button 
                                            onClick={() => setNewCharImages(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                         >
                                             <X className="w-4 h-4" />
                                         </button>
                                     </div>
                                 ))}
                                 <button 
                                    onClick={() => createFileInputRef.current?.click()}
                                    disabled={isProcessing}
                                    className="aspect-square rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-indigo-500 hover:bg-white/5 transition-colors text-white/40 hover:text-indigo-400"
                                 >
                                     {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
                                 </button>
                             </div>
                        </div>
                        
                        <button 
                            onClick={handleCreateSubmit}
                            disabled={!newCharName.trim() || newCharImages.length === 0 || isProcessing}
                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                        >
                            Сохранить
                        </button>
                    </div>
                    <input type="file" ref={createFileInputRef} onChange={handleCreateModalFiles} accept="image/*" multiple className="hidden" />
                </motion.div>
            </div>
          )}
          
          <Header 
            title="Мои Аватары" 
            icon={Users}
            action={
                <div className="flex gap-2">
                    {isProfileSelectionMode ? (
                        <>
                            <button onClick={() => { setIsProfileSelectionMode(false); setSelectedProfileIds(new Set()); }} className="text-xs font-bold text-slate-500 dark:text-white/60 px-3 py-2 hover:text-slate-900 dark:hover:text-white transition-colors">
                                Отмена
                            </button>
                            <button 
                                onClick={deleteSelectedProfiles}
                                disabled={selectedProfileIds.size === 0}
                                className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-50 transition-colors"
                            >
                                Удалить ({selectedProfileIds.size})
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsProfileSelectionMode(true)} className="bg-slate-200 dark:bg-white/5 border border-transparent dark:border-white/10 p-2.5 rounded-xl text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/10 transition-colors" title="Управление">
                            <CheckSquare className="w-5 h-5" />
                        </button>
                    )}
                </div>
            } 
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {!isProfileSelectionMode && (
                  <button 
                      onClick={() => {
                          setNewCharName('');
                          setNewCharImages([]);
                          setShowCreateModal(true);
                      }}
                      className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-white/40 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 group"
                  >
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                          <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">Создать</span>
                  </button>
              )}

              {profiles.map(p => {
                  const isSelected = selectedProfileIds.has(p.id);
                  return (
                    <div 
                        key={p.id} 
                        onClick={() => {
                            if (isProfileSelectionMode) { const newSet = new Set(selectedProfileIds); if (newSet.has(p.id)) newSet.delete(p.id); else newSet.add(p.id); setSelectedProfileIds(newSet); }
                            else setViewingProfile(p);
                        }} 
                        className={`bg-white dark:bg-white/5 border rounded-2xl overflow-hidden group relative flex flex-col cursor-pointer transition-all active:scale-[0.98] ${
                            isProfileSelectionMode && isSelected 
                            ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl' 
                            : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/30'
                        }`}
                    >
                       <div className="aspect-[3/4] bg-slate-100 dark:bg-black relative pointer-events-none">
                          {p.images.length > 0 ? (
                              <>
                                <img src={p.images[p.images.length-1].url} className="w-full h-full object-cover" />
                                {p.images.length > 1 && (
                                  <div className="absolute bottom-0 right-0 p-2 flex gap-1 justify-end">
                                      {p.images.slice(-3, -1).map((img) => (
                                          <div key={img.id} className="w-6 h-8 rounded border border-white/20 overflow-hidden shadow-sm bg-black">
                                              <img src={img.url} className="w-full h-full object-cover opacity-80" />
                                          </div>
                                      ))}
                                  </div>
                                )}
                              </>
                          ) : <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white/20"><UserPlus className="w-8 h-8" /></div>}
                       </div>
                       
                       {isProfileSelectionMode && (
                           <div className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-full border border-white/40 flex items-center justify-center transition-colors shadow-lg ${isSelected ? 'bg-indigo-600 border-indigo-500' : 'bg-black/40 backdrop-blur-md'}`}>
                               {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                           </div>
                       )}

                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none flex flex-col justify-end p-4">
                           <h3 className="font-bold text-white text-lg drop-shadow-md truncate">{p.name || 'Hero'}</h3>
                           <p className="text-xs text-white/70 font-medium">{p.images.length} фото</p>
                       </div>
                    </div>
                  );
              })}
          </div>
      </div>
    );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Zap, Sparkles, Key, Eye, EyeOff, Plus, X, Check, AlertCircle, Trash2, Info, Lock, Shield, Palette } from 'lucide-react';
import { VeoModel } from '../types';

// ================================
// ⚙️ ENHANCED SETTINGS VIEW
// Features: API Key Testing + Model Selection
// ================================

interface SettingsViewProps {
  closeView: () => void;
}

interface APIProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  keyName: string;
  testEndpoint?: string;
  models: string[];
}

const API_PROVIDERS: APIProvider[] = [
  {
    id: 'google',
    name: 'Google AI',
    icon: '🤖',
    description: 'Gemini models for AI generation',
    keyName: 'GEMINI_API_KEY',
    testEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🧠',
    description: 'GPT models for text generation',
    keyName: 'OPENAI_API_KEY',
    testEndpoint: 'https://api.openai.com/v1/models',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '💜',
    description: 'Claude models for advanced reasoning',
    keyName: 'ANTHROPIC_API_KEY',
    testEndpoint: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  },
  {
    id: 'replicate',
    name: 'Replicate',
    icon: '🎨',
    description: 'Video and image generation',
    keyName: 'REPLICATE_API_KEY',
    testEndpoint: 'https://api.replicate.com/v1/models',
    models: ['veo-2', 'stable-video-diffusion', 'runway-ml']
  },
  {
    id: 'stability',
    name: 'Stability AI',
    icon: '⚡',
    description: 'Image generation with Stable Diffusion',
    keyName: 'STABILITY_API_KEY',
    testEndpoint: 'https://api.stability.ai/v1/user/account',
    models: ['stable-diffusion-xl', 'stable-diffusion-3', 'sdxl-turbo']
  }
];

export const SettingsView: React.FC<SettingsViewProps> = ({ closeView }) => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [showModelSelector, setShowModelSelector] = useState<string | null>(null);

  React.useEffect(() => {
    // Load API keys and selected models from localStorage
    const loadedKeys: Record<string, string> = {};
    const loadedModels: Record<string, string> = {};

    API_PROVIDERS.forEach(provider => {
      const key = localStorage.getItem(provider.keyName) || '';
      const model = localStorage.getItem(`${provider.keyName}_MODEL`) || provider.models[0];
      loadedKeys[provider.id] = key;
      loadedModels[provider.id] = model;
    });

    setApiKeys(loadedKeys);
    setSelectedModels(loadedModels);
  }, []);

  const testAPIKey = async (provider: APIProvider) => {
    const key = apiKeys[provider.id];
    if (!key || !provider.testEndpoint) return;

    setTestingStatus(prev => ({ ...prev, [provider.id]: 'testing' }));
    setTestResults(prev => ({ ...prev, [provider.id]: 'Testing...' }));

    try {
      const headers: HeadersInit = {};

      // Set appropriate auth headers based on provider
      if (provider.id === 'google') {
        headers['x-goog-api-key'] = key;
      } else if (provider.id === 'openai' || provider.id === 'replicate' || provider.id === 'stability') {
        headers['Authorization'] = `Bearer ${key}`;
      } else if (provider.id === 'anthropic') {
        headers['x-api-key'] = key;
        headers['anthropic-version'] = '2023-06-01';
      }

      const response = await fetch(provider.testEndpoint, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        setTestingStatus(prev => ({ ...prev, [provider.id]: 'success' }));
        setTestResults(prev => ({ ...prev, [provider.id]: '✅ API key is valid!' }));
      } else {
        const errorText = await response.text();
        setTestingStatus(prev => ({ ...prev, [provider.id]: 'error' }));
        setTestResults(prev => ({ 
          ...prev, 
          [provider.id]: `❌ Error ${response.status}: ${errorText.substring(0, 100)}` 
        }));
      }
    } catch (error) {
      setTestingStatus(prev => ({ ...prev, [provider.id]: 'error' }));
      setTestResults(prev => ({ 
        ...prev, 
        [provider.id]: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    }
  };

  const saveAPIKey = (providerId: string, keyName: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [providerId]: value }));
    if (value) {
      localStorage.setItem(keyName, value);
    } else {
      localStorage.removeItem(keyName);
    }
    // Reset test status when key changes
    setTestingStatus(prev => ({ ...prev, [providerId]: 'idle' }));
    setTestResults(prev => ({ ...prev, [providerId]: '' }));
  };

  const selectModel = (providerId: string, keyName: string, model: string) => {
    setSelectedModels(prev => ({ ...prev, [providerId]: model }));
    localStorage.setItem(`${keyName}_MODEL`, model);
    setShowModelSelector(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="settings-view"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: 'var(--bg-primary)',
        overflowY: 'auto',
        padding: '2rem'
      }}
    >
      {/* Header */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ⚙️ API Settings
          </h1>
          <button
            onClick={closeView}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            ✕ Close
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Configure AI providers, test API keys, and select models
        </p>
      </div>

      {/* API Providers Grid */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'grid',
        gap: '1.5rem'
      }}>
        {API_PROVIDERS.map(provider => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Provider Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '2rem' }}>{provider.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {provider.name}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  {provider.description}
                </p>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: apiKeys[provider.id] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: apiKeys[provider.id] ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
              }}>
                {apiKeys[provider.id] ? '✓ Connected' : '○ Not Set'}
              </div>
            </div>

            {/* API Key Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                API Key
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  value={apiKeys[provider.id] || ''}
                  onChange={(e) => saveAPIKey(provider.id, provider.keyName, e.target.value)}
                  placeholder={`Enter your ${provider.name} API key`}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  onClick={() => testAPIKey(provider)}
                  disabled={!apiKeys[provider.id] || testingStatus[provider.id] === 'testing'}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: testingStatus[provider.id] === 'success' 
                      ? 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(21, 128, 61) 100%)'
                      : testingStatus[provider.id] === 'error'
                      ? 'linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(185, 28, 28) 100%)'
                      : 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: apiKeys[provider.id] && testingStatus[provider.id] !== 'testing' ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    opacity: !apiKeys[provider.id] || testingStatus[provider.id] === 'testing' ? 0.6 : 1,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {testingStatus[provider.id] === 'testing' ? '⏳ Testing...' : 
                   testingStatus[provider.id] === 'success' ? '✓ Valid' :
                   testingStatus[provider.id] === 'error' ? '✗ Failed' :
                   '🧪 Test Key'}
                </button>
              </div>
              {testResults[provider.id] && (
                <p style={{
                  marginTop: '0.5rem',
                  fontSize: '0.875rem',
                  color: testingStatus[provider.id] === 'success' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                }}>
                  {testResults[provider.id]}
                </p>
              )}
            </div>

            {/* Model Selection */}
            {provider.models.length > 0 && apiKeys[provider.id] && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Model Selection
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowModelSelector(showModelSelector === provider.id ? null : provider.id)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{selectedModels[provider.id] || provider.models[0]}</span>
                    <span>{showModelSelector === provider.id ? '▲' : '▼'}</span>
                  </button>

                  {showModelSelector === provider.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '0.5rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        zIndex: 10,
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {provider.models.map(model => (
                        <div
                          key={model}
                          onClick={() => selectModel(provider.id, provider.keyName, model)}
                          style={{
                            padding: '0.75rem',
                            cursor: 'pointer',
                            background: selectedModels[provider.id] === model ? 'var(--glass-bg)' : 'transparent',
                            borderBottom: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem'
                          }}
                        >
                          {selectedModels[provider.id] === model && '✓ '}{model}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div style={{
        maxWidth: '900px',
        margin: '2rem auto 0',
        padding: '1rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ marginBottom: '0.5rem' }}>
          💡 <strong>Tip:</strong> API keys are stored locally in your browser and never sent to our servers.
        </p>
        <p>
          🔒 Test your keys to ensure they work properly before using them in the app.
        </p>
      </div>
    </motion.div>
  );
};

export const ServiceCard = ({ icon: Icon, config, color, onClick }: any) => {
    const isConnected = config?.isEnabled;
    return (
        <button 
            onClick={onClick}
            className={`w-full bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-2xl p-5 flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98] ${isConnected ? 'dark:border-green-500/30 hover:border-green-500/50 dark:bg-green-500/5 border-green-500/30 bg-green-50' : 'hover:border-slate-300 dark:hover:border-white/20'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{config.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500/50'}`} />
                        <p className={`text-[10px] font-mono uppercase tracking-wider ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-white/40'}`}>
                            {isConnected ? 'Connected' : 'Not Configured'}
                        </p>
                    </div>
                </div>
            </div>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isConnected ? 'border-green-500/30 text-green-500 bg-green-500/10' : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/20 group-hover:bg-slate-100 dark:group-hover:bg-white/10'}`}>
                {isConnected ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
        </button>
    );
};

export const IntegrationsView = ({ integrations, setIntegrations }: { integrations: IntegrationConfig[], setIntegrations: (v: IntegrationConfig[]) => void }) => {
    const [editingConfig, setEditingConfig] = useState<IntegrationConfig | null>(null);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [apiKey, setApiKey] = useState('');

    const handleSave = async () => {
        if (!editingConfig) return;
        
        const newConfig = { ...editingConfig };
        
        if (editingConfig.id === IntegrationType.DISCORD || editingConfig.id === IntegrationType.ZAPIER || editingConfig.id === IntegrationType.WEBHOOK) {
            newConfig.config.webhookUrl = webhookUrl.trim();
            // Basic validation
            newConfig.isEnabled = !!newConfig.config.webhookUrl.startsWith('http');
        } else {
            // Mock validation for OAuth services
            newConfig.config.accessToken = apiKey;
            newConfig.isEnabled = !!apiKey;
        }

        const updated = integrations.map(i => i.id === newConfig.id ? newConfig : i);
        setIntegrations(updated);
        await saveToDB(STORES_CONST.INTEGRATIONS, newConfig);
        setEditingConfig(null);
    };

    const handleDisconnect = async () => {
        if (!editingConfig) return;
        const newConfig = { ...editingConfig, isEnabled: false, config: {} };
        const updated = integrations.map(i => i.id === newConfig.id ? newConfig : i);
        setIntegrations(updated);
        await saveToDB(STORES_CONST.INTEGRATIONS, newConfig);
        setEditingConfig(null);
    }

    const openConfig = (config: IntegrationConfig) => {
        setWebhookUrl(config.config.webhookUrl || '');
        setApiKey(config.config.accessToken || '');
        setEditingConfig(config);
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 pb-32">
            <Header title="Интеграции" icon={Puzzle} />
            
            <p className="text-sm text-slate-600 dark:text-white/60 mb-6 bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                Автоматизируйте публикацию контента с помощью Webhooks, Zapier или прямых подключений.
            </p>

            <div className="grid gap-4">
                {integrations.map(config => {
                    let Icon = Share2;
                    let color = 'bg-gray-800';
                    if (config.id === IntegrationType.YOUTUBE) { Icon = Film; color = 'bg-red-600'; }
                    if (config.id === IntegrationType.TIKTOK) { Icon = Share2; color = 'bg-gradient-to-br from-black to-gray-800 border border-white/20'; }
                    if (config.id === IntegrationType.INSTAGRAM) { Icon = Users; color = 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600'; }
                    if (config.id === IntegrationType.DISCORD) { Icon = MessageSquare; color = 'bg-[#5865F2]'; }
                    if (config.id === IntegrationType.ZAPIER) { Icon = Zap; color = 'bg-[#FF4F00]'; }
                    if (config.id === IntegrationType.WEBHOOK) { Icon = Workflow; color = 'bg-blue-600'; }
                    
                    return (
                        <ServiceCard 
                            key={config.id} 
                            icon={Icon} 
                            config={config} 
                            color={color} 
                            onClick={() => openConfig(config)} 
                        />
                    );
                })}
            </div>

            {/* Config Modal */}
            <AnimatePresence>
                {editingConfig && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingConfig(null)} />
                        <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                             <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    Настройка {editingConfig.name}
                                </h3>
                                <button onClick={() => setEditingConfig(null)} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-4">
                                {editingConfig.id === IntegrationType.DISCORD || editingConfig.id === IntegrationType.ZAPIER || editingConfig.id === IntegrationType.WEBHOOK ? (
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-white/40 mb-1.5 block">Webhook URL / Endpoint</label>
                                        <input 
                                            type="text" 
                                            value={webhookUrl}
                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none text-sm font-mono"
                                        />
                                        <p className="text-[10px] text-white/30 mt-2">
                                            {editingConfig.id === IntegrationType.ZAPIER 
                                                ? "Используйте 'Catch Hook' триггер в Zapier." 
                                                : "Мы отправим POST запрос с файлом видео (multipart/form-data)."
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                         <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-3 items-start mb-4">
                                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                            <p className="text-xs text-amber-200/80">
                                                Прямая API интеграция для {editingConfig.name} требует OAuth сервера. В данной демо-версии используется нативный Web Share API для мобильных устройств.
                                            </p>
                                         </div>
                                         <label className="text-[10px] font-bold uppercase text-white/40 mb-1.5 block">API Token (Mock)</label>
                                         <input 
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="••••••••••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none text-sm font-mono"
                                         />
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                    {editingConfig.isEnabled && (
                                        <button onClick={handleDisconnect} className="px-4 py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                                            Отключить
                                        </button>
                                    )}
                                    <button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};