/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from '@google/genai';

// ================================
// 🎯 MULTI-PROVIDER AI SERVICE
// Supports: Google AI, OpenAI, Anthropic, Replicate, Stability AI
// ================================

export interface AIProvider {
  id: string;
  name: string;
  supportsVideo: boolean;
  supportsImage: boolean;
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  google: { id: 'google', name: 'Google AI', supportsVideo: true, supportsImage: true },
  openai: { id: 'openai', name: 'OpenAI', supportsVideo: false, supportsImage: true },
  anthropic: { id: 'anthropic', name: 'Anthropic', supportsVideo: false, supportsImage: false },
  replicate: { id: 'replicate', name: 'Replicate', supportsVideo: true, supportsImage: true },
  stability: { id: 'stability', name: 'Stability AI', supportsVideo: false, supportsImage: true }
};

// Reference image types for backward compatibility
export interface VideoGenerationReferenceImage {
  base64?: string;
  url?: string;
  type?: string;
}

export enum VideoGenerationReferenceType {
  FIRST_FRAME = 'FIRST_FRAME',
  LAST_FRAME = 'LAST_FRAME'
}

// Get API key and selected model from localStorage
function getProviderConfig(providerId: string) {
  const keyName = `${providerId.toUpperCase()}_API_KEY`;
  const apiKey = localStorage.getItem(keyName) || '';
  const selectedModel = localStorage.getItem(`${keyName}_MODEL`) || '';
  return { apiKey, selectedModel };
}

// Updated Google AI video generation using new SDK
export async function generateVideoWithGemini(
  description: string,
  referenceImages: VideoGenerationReferenceImage[],
  onProgress?: (message: string) => void
): Promise<{ videoUrl: string; error?: string }> {
  try {
    const { apiKey, selectedModel } = getProviderConfig('GEMINI');

    if (!apiKey) {
      return { videoUrl: '', error: 'Google AI API key not configured' };
    }

    onProgress?.('Initializing Google AI...');
    const ai = new GoogleGenAI({ apiKey });

    onProgress?.('Generating video...');
    
    // New SDK uses models.generateContent
    const response = await ai.models.generateContent({
      model: selectedModel || 'veo-002',
      contents: description,
      config: {
        videoConfig: {
          referenceImages: referenceImages.length > 0 ? referenceImages : undefined
        }
      }
    });

    const videoUri = response?.candidates?.[0]?.videoUri;

    if (!videoUri) {
      throw new Error('No video generated');
    }

    onProgress?.('Video generation complete!');
    return { videoUrl: videoUri };

  } catch (error: any) {
    console.error('Google AI generation error:', error);
    return {
      videoUrl: '',
      error: error.message || 'Video generation failed'
    };
  }
}

// New: Multi-provider video generation dispatcher
export async function generateVideo(
  description: string,
  referenceImages: VideoGenerationReferenceImage[],
  providerId: string = 'google',
  onProgress?: (message: string) => void
): Promise<{ videoUrl: string; error?: string }> {
  const provider = AI_PROVIDERS[providerId];

  if (!provider) {
    return { videoUrl: '', error: `Unknown provider: ${providerId}` };
  }

  if (!provider.supportsVideo) {
    return { videoUrl: '', error: `${provider.name} does not support video generation` };
  }

  // Route to appropriate provider
  switch (providerId) {
    case 'google':
      return generateVideoWithGemini(description, referenceImages, onProgress);

    case 'replicate':
      return generateVideoWithReplicate(description, referenceImages, onProgress);

    default:
      return { videoUrl: '', error: `Provider ${provider.name} not yet implemented` };
  }
}

// Replicate video generation
async function generateVideoWithReplicate(
  description: string,
  referenceImages: VideoGenerationReferenceImage[],
  onProgress?: (message: string) => void
): Promise<{ videoUrl: string; error?: string }> {
  try {
    const { apiKey, selectedModel } = getProviderConfig('REPLICATE');

    if (!apiKey) {
      return { videoUrl: '', error: 'Replicate API key not configured' };
    }

    onProgress?.('Initializing Replicate...');

    // Use Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: selectedModel || 'stable-video-diffusion',
        input: {
          prompt: description,
          image: referenceImages[0]?.base64 || undefined
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = await response.json();
    onProgress?.('Waiting for video generation...');

    // Poll for completion
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      result = await pollResponse.json();
      onProgress?.(`Status: ${result.status}...`);
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Video generation failed');
    }

    onProgress?.('Video generation complete!');
    return { videoUrl: result.output };

  } catch (error: any) {
    console.error('Replicate generation error:', error);
    return {
      videoUrl: '',
      error: error.message || 'Video generation failed'
    };
  }
}

// Export legacy function for backward compatibility
export { generateVideoWithGemini as default };
