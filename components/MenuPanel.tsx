/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Users, 
  Video, 
  Link2, 
  Settings, 
  Database,
  Upload,
  ChevronRight,
  X,
  Mic,
  Type,
  Play,
  FileText,
  Image,
  Music
} from 'lucide-react';

const menuItems = [
  { id: 'avatars', label: 'Аватары', icon: Users, description: 'Загрузка и управление аватарами' },
  { id: 'generations', label: 'Генерации', icon: Video, description: 'История созданных видео' },
  { id: 'knowledge', label: 'База знаний', icon: Database, description: 'Документы и данные' },
  { id: 'integrations', label: 'Интеграции', icon: Link2, description: 'Подключенные сервисы' },
  { id: 'settings', label: 'Настройки', icon: Settings, description: 'Параметры приложения' },
];

const MenuPanel: React.FC = () => {
  const { menuPage, setMenuPage, avatars, setAvatars, feed, knowledgeItems, addKnowledgeItem, removeKnowledgeItem } = useApp();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const knowledgeInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const newAvatar = {
        id: `avatar-${Date.now()}`,
        name: file.name.split('.')[0],
        imageUrl: url,
      };
      setAvatars(prev => [...prev, newAvatar]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKnowledgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        let type: 'document' | 'video' | 'image' | 'audio' = 'document';
        if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('audio/')) type = 'audio';
        
        addKnowledgeItem({
          type,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadedAt: new Date().toLocaleDateString('ru-RU'),
          tags: [],
        });
      });
    }
    if (knowledgeInputRef.current) knowledgeInputRef.current.value = '';
  };

  const renderPageContent = () => {
    switch (menuPage) {
      case 'avatars':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-foreground">Аватары</h2>
              <button onClick={() => setMenuPage(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-border rounded-2xl hover:border-primary hover:bg-muted/50 transition-all group"
            >
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
              <p className="text-foreground font-medium">Загрузить аватар</p>
              <p className="text-sm text-muted-foreground mt-1">PNG, JPG до 10MB</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </button>
            
            {avatars.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {avatars.map((avatar) => (
                  <div key={avatar.id} className="aspect-square rounded-2xl overflow-hidden bg-muted relative group">
                    <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-white text-sm truncate">{avatar.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {avatars.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">Нет загруженных аватаров</p>
              </div>
            )}
          </div>
        );
        
      case 'generations':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-foreground">Генерации</h2>
              <button onClick={() => setMenuPage(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-3">
              {feed.filter(f => f.videoUrl).map((video) => (
                <div key={video.id} className="flex gap-4 p-3 bg-muted/50 rounded-2xl hover:bg-muted transition-colors">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-background shrink-0">
                    <video src={video.videoUrl} className="w-full h-full object-cover" muted />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{video.description}</p>
                    <p className="text-sm text-muted-foreground mt-1">{video.modelTag}</p>
                  </div>
                  <button className="p-2 hover:bg-background rounded-xl transition-colors self-center">
                    <Play className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'knowledge':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-foreground">База знаний</h2>
              <button onClick={() => setMenuPage(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <button
              onClick={() => knowledgeInputRef.current?.click()}
              className="w-full p-6 border-2 border-dashed border-border rounded-2xl hover:border-primary hover:bg-muted/50 transition-all group"
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
              <p className="text-foreground font-medium">Загрузить файлы</p>
              <p className="text-sm text-muted-foreground mt-1">Документы, видео, изображения, аудио</p>
              <input ref={knowledgeInputRef} type="file" multiple onChange={handleKnowledgeUpload} className="hidden" />
            </button>
            
            <div className="space-y-2">
              {knowledgeItems.map((item) => {
                const Icon = item.type === 'video' ? Video : item.type === 'image' ? Image : item.type === 'audio' ? Music : FileText;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.size} • {item.uploadedAt}</p>
                    </div>
                    <button onClick={() => removeKnowledgeItem(item.id)} className="p-1.5 hover:bg-background rounded-lg transition-colors">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </div>
            
            {knowledgeItems.length === 0 && (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">База знаний пуста</p>
              </div>
            )}
          </div>
        );
        
      case 'integrations':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-foreground">Интеграции</h2>
              <button onClick={() => setMenuPage(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-3">
              {[
                { name: 'HeyGen', desc: 'Генерация аватаров', connected: false },
                { name: 'ElevenLabs', desc: 'Синтез речи', connected: false },
                { name: 'Google AI', desc: 'Veo генерация видео', connected: true },
              ].map((int) => (
                <div key={int.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div>
                    <p className="text-foreground font-medium">{int.name}</p>
                    <p className="text-sm text-muted-foreground">{int.desc}</p>
                  </div>
                  <button className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    int.connected 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted hover:bg-muted-foreground/10 text-foreground'
                  }`}>
                    {int.connected ? 'Подключено' : 'Подключить'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-foreground">Настройки</h2>
              <button onClick={() => setMenuPage(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                  <span className="text-foreground">Тема</span>
                </div>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="px-4 py-2 bg-muted rounded-xl text-sm text-foreground hover:bg-muted-foreground/10 transition-colors"
                >
                  {theme === 'dark' ? 'Темная' : 'Светлая'}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Mic className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Голос по умолчанию</span>
                </div>
                <button className="px-4 py-2 bg-muted rounded-xl text-sm text-foreground hover:bg-muted-foreground/10 transition-colors">
                  Выбрать
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Язык</span>
                </div>
                <button className="px-4 py-2 bg-muted rounded-xl text-sm text-foreground hover:bg-muted-foreground/10 transition-colors">
                  Русский
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (menuPage) {
    return (
      <div className="h-full bg-background overflow-y-auto no-scrollbar">
        {renderPageContent()}
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col justify-center px-6">
      {/* Theme toggle at top */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-3 bg-muted rounded-2xl hover:bg-muted-foreground/10 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
        </button>
      </div>
      
      <div className="space-y-3 max-w-md mx-auto w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setMenuPage(item.id)}
              className="w-full flex items-center gap-4 p-5 bg-card hover:bg-muted rounded-2xl transition-all group border border-border/50 hover:border-border"
            >
              <div className="p-3 bg-muted rounded-xl group-hover:bg-background transition-colors">
                <Icon className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-lg font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MenuPanel;
