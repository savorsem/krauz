/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Send, 
  Image, 
  Video, 
  Sparkles, 
  Bot,
  User,
  Upload,
  FileVideo,
  RefreshCcw
} from 'lucide-react';

const suggestedPrompts = [
  "Create a script for a product demo video",
  "Generate ideas for a social media campaign",
  "Help me plan a face swap video",
  "Write a storyboard for my concept",
];

const AIChatPanel: React.FC = () => {
  const { isChatPanelOpen, setIsChatPanelOpen, chatMessages, addChatMessage, clearChat } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<{ type: string; name: string; file?: File }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const userMessage = {
      role: 'user' as const,
      content: input,
      attachments: attachments.map(a => ({ type: a.type, name: a.name })),
    };

    addChatMessage(userMessage);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you with that! Based on your request, here's what I suggest:\n\n1. **Concept Development**: Start with a clear narrative arc\n2. **Visual Planning**: Sketch out key scenes\n3. **Avatar Selection**: Choose the right presenter\n4. **Script Writing**: Craft engaging dialogue\n\nWould you like me to elaborate on any of these steps?",
        "Great idea! For a face replacement video, you'll want to:\n\n- Upload a clear frontal photo of the subject\n- Select a video with similar lighting conditions\n- Ensure the face angles match reasonably well\n\nI can help you optimize the settings for the best results. What kind of video are you working with?",
        "Here's a creative script concept for your video:\n\n**Opening**: Dynamic text overlay with music\n**Middle**: Your avatar presenting key points\n**Closing**: Call-to-action with contact info\n\nShall I expand this into a full script with dialogue?",
      ];
      
      addChatMessage({
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        setAttachments(prev => [...prev, { type: 'image', name: file.name, file }]);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        setAttachments(prev => [...prev, { type: 'video', name: file.name, file }]);
      });
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  if (!isChatPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={() => setIsChatPanelOpen(false)}
      />
      
      {/* Panel - slides from right */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">Video editing scenarios & scripts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Clear chat"
            >
              <RefreshCcw className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setIsChatPanelOpen(false)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Video Assistant</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                I can help you create video scripts, plan face replacements, and develop creative scenarios.
              </p>
              
              {/* Suggested prompts */}
              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Try asking:</p>
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="w-full text-left p-3 rounded-xl bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {message.attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-1 px-2 py-1 bg-background/20 rounded text-xs">
                            {att.type === 'image' ? <Image className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                            {att.name}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-t border-border flex flex-wrap gap-2">
            {attachments.map((att, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                {att.type === 'image' ? <Image className="w-4 h-4 text-muted-foreground" /> : <FileVideo className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm text-foreground truncate max-w-[100px]">{att.name}</span>
                <button onClick={() => removeAttachment(index)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex items-end gap-2">
            {/* Upload buttons */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Upload image for face replacement"
              >
                <Image className="w-5 h-5 text-muted-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Upload video"
              >
                <Video className="w-5 h-5 text-muted-foreground" />
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Ask about video editing, scripts, face replacement..."
                className="w-full px-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={1}
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() && attachments.length === 0}
              className={`p-3 rounded-xl transition-all ${
                input.trim() || attachments.length > 0
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChatPanel;
