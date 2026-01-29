/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Upload, 
  Mic, 
  Play, 
  Trash2, 
  Settings2,
  Volume2,
  Check,
  Sparkles,
  Video,
  FileAudio
} from 'lucide-react';

type VoiceOption = {
  id: string;
  name: string;
  language: string;
  gender: string;
  preview?: string;
};

const defaultVoices: VoiceOption[] = [
  { id: 'v1', name: 'Sarah', language: 'English (US)', gender: 'Female' },
  { id: 'v2', name: 'Michael', language: 'English (US)', gender: 'Male' },
  { id: 'v3', name: 'Emma', language: 'English (UK)', gender: 'Female' },
  { id: 'v4', name: 'James', language: 'English (UK)', gender: 'Male' },
  { id: 'v5', name: 'Sofia', language: 'Spanish', gender: 'Female' },
  { id: 'v6', name: 'Lucas', language: 'Portuguese', gender: 'Male' },
];

const renderFormats = [
  { id: '720p', label: '720p HD', description: 'Fast rendering, smaller file' },
  { id: '1080p', label: '1080p Full HD', description: 'Balanced quality and speed' },
  { id: '4k', label: '4K Ultra HD', description: 'Highest quality, slower render' },
];

const AvatarsPage: React.FC = () => {
  const { avatars, setAvatars, selectedAvatar, setSelectedAvatar } = useApp();
  const [activeTab, setActiveTab] = useState<'avatars' | 'voices' | 'render'>('avatars');
  const [voices, setVoices] = useState<VoiceOption[]>(defaultVoices);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('1080p');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newAvatar = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl: url,
      };
      setAvatars(prev => [newAvatar, ...prev]);
      setSelectedAvatar(newAvatar);
    }
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newVoice: VoiceOption = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        language: 'Custom',
        gender: 'Custom',
      };
      setVoices(prev => [newVoice, ...prev]);
      setSelectedVoice(newVoice.id);
    }
    if (voiceInputRef.current) voiceInputRef.current.value = '';
  };

  const handleDeleteAvatar = (id: string) => {
    setAvatars(prev => prev.filter(a => a.id !== id));
    if (selectedAvatar?.id === id) {
      setSelectedAvatar(null);
    }
  };

  const handleStartRender = () => {
    if (!selectedAvatar || !selectedVoice || !textToSpeak.trim()) {
      return;
    }
    setIsGenerating(true);
    // Simulate rendering
    setTimeout(() => {
      setIsGenerating(false);
      alert('Video rendering complete! Check the Generations page.');
    }, 3000);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="max-w-6xl mx-auto p-4 md:p-6 md:pl-24 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Avatar Studio</h1>
          <p className="text-muted-foreground">Create videos with AI avatars, custom voices, and more</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border pb-2">
          {[
            { id: 'avatars', label: 'Avatars', icon: Sparkles },
            { id: 'voices', label: 'Voices', icon: Volume2 },
            { id: 'render', label: 'Render', icon: Video },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Avatars Tab */}
        {activeTab === 'avatars' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Select or Upload Avatar</h2>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload Custom</span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedAvatar?.id === avatar.id
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="aspect-square bg-muted">
                    <img
                      src={avatar.imageUrl}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background to-transparent">
                    <p className="text-sm font-medium text-foreground truncate">{avatar.name}</p>
                  </div>
                  {selectedAvatar?.id === avatar.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  {avatar.id.startsWith('custom-') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAvatar(avatar.id);
                      }}
                      className="absolute top-2 left-2 p-1.5 bg-destructive/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-destructive-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voices Tab */}
        {activeTab === 'voices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Voice Selection</h2>
              <button
                onClick={() => voiceInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
              >
                <FileAudio className="w-4 h-4" />
                <span className="text-sm">Upload Voice</span>
              </button>
              <input
                ref={voiceInputRef}
                type="file"
                accept="audio/*"
                onChange={handleVoiceUpload}
                className="hidden"
              />
            </div>

            {/* Voice List */}
            <div className="grid gap-3">
              {voices.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedVoice === voice.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedVoice === voice.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{voice.name}</p>
                      <p className="text-sm text-muted-foreground">{voice.language} - {voice.gender}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Play className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {selectedVoice === voice.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Text to Speech */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Text to Speech</h3>
              <textarea
                value={textToSpeak}
                onChange={(e) => setTextToSpeak(e.target.value)}
                placeholder="Enter the text you want your avatar to speak..."
                className="w-full h-32 p-4 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        )}

        {/* Render Tab */}
        {activeTab === 'render' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Render Settings</h2>

            {/* Selected Configuration */}
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Selection</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Avatar:</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedAvatar?.name || 'None selected'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Voice:</span>
                  <span className="text-sm font-medium text-foreground">
                    {voices.find(v => v.id === selectedVoice)?.name || 'None selected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Output Format</h3>
              <div className="grid gap-3">
                {renderFormats.map((format) => (
                  <div
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedFormat === format.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-foreground">{format.label}</p>
                      <p className="text-sm text-muted-foreground">{format.description}</p>
                    </div>
                    {selectedFormat === format.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Render Button */}
            <button
              onClick={handleStartRender}
              disabled={!selectedAvatar || !selectedVoice || !textToSpeak.trim() || isGenerating}
              className={`w-full py-4 rounded-xl font-medium text-lg transition-all ${
                selectedAvatar && selectedVoice && textToSpeak.trim() && !isGenerating
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Rendering...
                </span>
              ) : (
                'Start Rendering'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarsPage;
