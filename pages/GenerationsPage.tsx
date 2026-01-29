/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { useApp, KnowledgeItem } from '../context/AppContext';
import { 
  Video, 
  FileText, 
  Image, 
  Music, 
  Upload, 
  Search, 
  Filter, 
  Trash2,
  Download,
  Eye,
  Tag,
  Calendar,
  HardDrive,
  FolderOpen
} from 'lucide-react';

const GenerationsPage: React.FC = () => {
  const { feed, knowledgeItems, addKnowledgeItem, removeKnowledgeItem } = useApp();
  const [activeTab, setActiveTab] = useState<'generations' | 'knowledge'>('generations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const type = file.type.startsWith('video/') ? 'video' 
          : file.type.startsWith('image/') ? 'image'
          : file.type.startsWith('audio/') ? 'audio'
          : 'document';
        
        addKnowledgeItem({
          type,
          name: file.name,
          size: formatFileSize(file.size),
          uploadedAt: new Date().toISOString(),
          tags: [],
        });
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'audio': return Music;
      default: return FileText;
    }
  };

  const filteredGenerations = feed.filter(post => 
    post.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredKnowledge = knowledgeItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !selectedFilter || item.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="max-w-6xl mx-auto p-4 md:p-6 md:pl-24 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Generations & Knowledge Base</h1>
          <p className="text-muted-foreground">Manage your video generations and data assets</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab('generations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'generations'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="text-sm font-medium">Generations ({feed.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'knowledge'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Knowledge Base ({knowledgeItems.length})</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {activeTab === 'knowledge' && (
            <>
              <div className="flex gap-2">
                {['video', 'image', 'audio', 'document'].map((type) => {
                  const Icon = getTypeIcon(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedFilter(selectedFilter === type ? null : type)}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        selectedFilter === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Generations Tab */}
        {activeTab === 'generations' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGenerations.map((post) => (
              <div
                key={post.id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="aspect-video bg-muted relative">
                  {post.videoUrl ? (
                    <video
                      src={post.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-medium text-foreground">
                    {post.modelTag}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-foreground line-clamp-2 mb-3">{post.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">@{post.username}</span>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <>
            {knowledgeItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No files yet</h3>
                <p className="text-muted-foreground mb-6">Upload documents, videos, images, or audio to build your knowledge base</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Files</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredKnowledge.map((item) => {
                  const Icon = getTypeIcon(item.type);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {item.size}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.uploadedAt).toLocaleDateString()}
                          </span>
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button 
                          onClick={() => removeKnowledgeItem(item.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GenerationsPage;
