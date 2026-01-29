/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Key } from 'lucide-react';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-card border border-border backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full p-8 text-center flex flex-col items-center relative overflow-hidden">
        
        <div className="bg-muted p-5 rounded-full mb-6 relative z-10">
          <Key className="w-8 h-8 text-foreground opacity-90" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-3 tracking-wide">Требуется настройка</h2>
        
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed font-light">
          Для работы с моделью Veo необходим API ключ от Google Cloud проекта с включенной оплатой.
        </p>
        
        <button
          onClick={onContinue}
          className="w-full px-6 py-3.5 bg-foreground hover:bg-foreground/90 text-background font-bold rounded-xl transition-all text-sm tracking-wider uppercase hover:-translate-y-0.5"
        >
          Выбрать API ключ
        </button>

        <p className="text-muted-foreground mt-6 text-xs font-medium">
          Подробнее о{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-foreground/80 transition-colors underline underline-offset-2"
          >
            оплате
          </a>{' '}
          и{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/pricing#veo-3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-foreground/80 transition-colors underline underline-offset-2"
          >
            ценах
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyDialog;
