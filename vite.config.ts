import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY || ''),
        'process.env.AUTONOMA_CLIENT_ID': JSON.stringify(env.AUTONOMA_CLIENT_ID || ''),
        'process.env.AUTONOMA_SECRETT_ID': JSON.stringify(env.AUTONOMA_SECRET_ID || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
