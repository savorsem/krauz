/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Image, Video, X, RefreshCcw } from 'lucide-react';

const ChatPanel: React.FC = () => {
  const { chatMessages, addChatMessage, clearChat } = useApp();
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

    addChatMessage({
      role: 'user',
      content: input,
      attachments: attachments.map(a => ({ type: a.type, name: a.name })),
    });

    setInput('');
    setAttachments([]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Отлично! Для вашего видео я предлагаю следующую структуру:\n\n1. **Вступление** — динамичный хук на 3 секунды\n2. **Основная часть** — презентация ключевых моментов\n3. **Финал** — призыв к действию\n\nХотите, чтобы я написал полный сценарий?",
        "Для замены лица в видео вам понадобится:\n\n• Четкое фронтальное фото\n• Видео с похожим освещением\n• Совпадение ракурсов лица\n\nЗагрузите фото, и я помогу оптимизировать настройки.",
        "Вот креативная концепция для вашего ролика:\n\n**Открытие**: Эффектный текст с музыкой\n**Середина**: Ваш аватар представляет ключевые идеи\n**Закрытие**: Контактная информация\n\nРазвернуть в полный сценарий?",
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

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Clear button - minimal */}
      {chatMessages.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={clearChat}
            className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <RefreshCcw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {chatMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-foreground/20 animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-foreground text-background'
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
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-4 rounded-2xl">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
        <div className="px-4 py-2 flex flex-wrap gap-2">
          {attachments.map((att, index) => (
            <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              {att.type === 'image' ? <Image className="w-4 h-4 text-muted-foreground" /> : <Video className="w-4 h-4 text-muted-foreground" />}
              <span className="text-sm text-foreground truncate max-w-[100px]">{att.name}</span>
              <button onClick={() => removeAttachment(index)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 pb-16">
        <div className="flex items-end gap-2 bg-muted/50 rounded-2xl p-2">
          {/* Upload buttons */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
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
              className="p-2 rounded-xl hover:bg-muted transition-colors"
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
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="flex-1 px-3 py-2 bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none text-sm"
            rows={1}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() && attachments.length === 0}
            className={`p-2.5 rounded-xl transition-all ${
              input.trim() || attachments.length > 0
                ? 'bg-foreground text-background hover:scale-105'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
