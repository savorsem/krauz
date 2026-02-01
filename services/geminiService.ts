/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  GoogleGenAI,
  VideoGenerationReferenceImage,
  VideoGenerationReferenceType,
} from '@google/genai';
import {GenerateVideoParams, GenerationMode} from '../types';
import { getApiKeys, validateApiKey } from '../utils/envUtils';

export const generateVideo = async (
  params: GenerateVideoParams,
): Promise<{url: string; blob: Blob}> => {
  console.log('[Veo Service] Starting generation...', params.mode);

  const apiKeys = getApiKeys();
  const geminiKey = apiKeys.gemini;
  
  if (!geminiKey) {
    throw new Error('Gemini API Key is missing. Please configure your API key in the application settings.');
  }
  
  // Validate the API key format
  const validation = validateApiKey(geminiKey, 'gemini');
  if (!validation.valid) {
    throw new Error(`Invalid Gemini API Key: ${validation.error}`);
  }

  const ai = new GoogleGenAI({apiKey: geminiKey});

  const generateVideoPayload: any = {
    model: params.model,
    prompt: params.prompt,
    config: {
      numberOfVideos: 1,
      aspectRatio: params.aspectRatio,
      resolution: params.resolution,
    },
  };

try {
    if (params.mode === GenerationMode.FRAMES_TO_VIDEO) {
      if (params.startFrame) {
        generateVideoPayload.image = {
          imageBytes: params.startFrame.base64,
          mimeType: params.startFrame.file.type,
        };
      }
      
      const finalEndFrame = params.isLooping ? params.startFrame : params.endFrame;
      if (finalEndFrame) {
        generateVideoPayload.config.lastFrame = {
          imageBytes: finalEndFrame.base64,
          mimeType: finalEndFrame.file.type,
        };
      }
    } else if (params.mode === GenerationMode.REFERENCES_TO_VIDEO) {
      const referenceImagesPayload: VideoGenerationReferenceImage[] = [];

      if (params.referenceImages) {
        for (const img of params.referenceImages) {
          referenceImagesPayload.push({
            image: {
              imageBytes: img.base64,
              mimeType: img.file.type,
            },
            referenceType: VideoGenerationReferenceType.ASSET,
          });
        }
      }

      if (params.styleImage) {
        referenceImagesPayload.push({
          image: {
            imageBytes: params.styleImage.base64,
            mimeType: params.styleImage.file.type,
          },
          referenceType: VideoGenerationReferenceType.STYLE,
        });
      }

      if (referenceImagesPayload.length > 0) {
        generateVideoPayload.config.referenceImages = referenceImagesPayload;
        // Camco mode requires Veo Pro
        generateVideoPayload.model = 'veo-3.1-generate-preview';
      }
    }

    // STRICT CONSTRAINT ENFORCEMENT for Veo Pro
    if (generateVideoPayload.model === 'veo-3.1-generate-preview') {
        console.log('[Veo Service] Auto-correcting config for Veo Pro: 16:9, 720p');
        generateVideoPayload.config.aspectRatio = '16:9';
        generateVideoPayload.config.resolution = '720p';
    }

  } catch (payloadError) {
    console.error("Error building payload:", payloadError);
    throw new Error("Failed to prepare request data.");
  }

  let operation;
  try {
      console.log('[Veo Service] Payload:', JSON.stringify(generateVideoPayload, null, 2));
      operation = await ai.models.generateVideos(generateVideoPayload);
      console.log('[Veo Service] Operation started:', operation.name);
  } catch (e: any) {
      console.error('[Veo Service] API Request Failed:', e);
      let msg = e.message || String(e);

      // Detect Quota/Billing issues
     if ( msg.includes('429') || msg.toLowerCase().includes('quota')) {
          msg = 'Quota exceeded. Please check your billing details.';
      } else if ( msg.includes('403') || msg.toLowerCase().includes('permission')) {
          msg = 'API Key invalid or billing disabled.';
      }
      throw new Error(msg);
  }

  const startTime = Date.now();
  const TIMEOUT_MS = 600000;
  const POLLING_INTERVAL = 5000;

  while (!operation.done) {
    if (Date.now() - startTime > TIMEOUT_MS) {
       throw new Error("Generation timed out.");
    }
    
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    
    try {
        operation = await ai.operations.getVideosOperation({operation: operation});
    } catch (pollError) {
        console.warn('[Veo Service] Polling network error, retrying...', pollError);
    }
  }

  if (operation.error) {
    console.error('[Veo Service] Backend Error:', operation.error);
    throw new Error(operation.error.message || 'Model refused request.');
  }

  const response = operation.response || (operation as any).result;
  const generatedVideos = response?.generatedVideos;

  if (generatedVideos?.length > 0) {
    const videoUri = generatedVideos[0].video?.uri;
    if (!videoUri) throw new Error('API returned success but no video URI.');

    try {
        const cleanUri = decodeURIComponent(videoUri);
        const fetchUrl = `${cleanUri}&key=${process.env.API_KEY}`;
        
        console.log('[Veo Service] Downloading video...');
        const res = await fetch(fetchUrl);
        
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        
        return { url, blob };
    } catch (downloadError: any) {
        console.error("Download error:", downloadError);
        throw new Error(`Failed to download video: ${downloadError.message}`);
    }
  } else {
    // Handle RAI Filtering (Safety Block)
    if (response?.raiMediaFilteredReasons && response.raiMediaFilteredReasons.length > 0) {
      const reason = response.raiMediaFilteredReasons[0];
      console.error('[Veo Service] RAI Filtered:', reason);
      throw new Error(`Content blocked due to safety guidelines: ${reason}`);
    }

    console.error('[Veo Service] Empty response:', JSON.stringify(operation, null, 2));
    throw new Error('No video generated. Please check your prompt and settings (Veo Pro requires 16:9/720p).');
  }
};