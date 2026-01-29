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

export const generateVideo = async (
  params: GenerateVideoParams,
): Promise<{url: string; blob: Blob}> => {
  console.log('[Veo Service] Starting generation...', params.mode);

  if (!process.env.API_KEY) {
    throw new Error('API Key is missing. Please select a key via the dialog.');
  }

  // Create a fresh instance to ensure the latest API key is used
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  // Construct Payload
  const generateVideoPayload: any = {
    model: params.model,
    prompt: params.prompt,
    config: {
      numberOfVideos: 1,
      aspectRatio: params.aspectRatio,
      resolution: params.resolution,
    },
  };

  // Handle Mode-Specific Configurations
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

      // If needed in future: Style images
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
      }
    }
  } catch (payloadError) {
    console.error("Error building payload:", payloadError);
    throw new Error("Failed to prepare request data.");
  }

  // 1. Submit Generation Request
  let operation;
  try {
      operation = await ai.models.generateVideos(generateVideoPayload);
      console.log('[Veo Service] Operation started:', operation.name);
  } catch (e: any) {
      console.error('[Veo Service] API Request Failed:', e);
      let msg = e.message || 'Unknown API error';
      if (msg.includes('403')) msg = 'API Key invalid or billing disabled.';
      if (msg.includes('429')) msg = 'Quota exceeded. Please try again later.';
      throw new Error(msg);
  }

  // 2. Poll for Completion
  const startTime = Date.now();
  const TIMEOUT_MS = 600000; // 10 minutes max (Veo can take time)
  const POLLING_INTERVAL = 5000;

  while (!operation.done) {
    if (Date.now() - startTime > TIMEOUT_MS) {
        throw new Error("Generation timed out (server took too long).");
    }
    
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    
    try {
        operation = await ai.operations.getVideosOperation({operation: operation});
    } catch (pollError) {
        console.warn('[Veo Service] Polling network error (retrying...):', pollError);
        // Do not throw here, transient network errors shouldn't fail the whole job
    }
  }

  // 3. Handle Result
  if (operation.error) {
    console.error('[Veo Service] Backend Processing Error:', operation.error);
    throw new Error(operation.error.message || 'The model refused the request (Safety or Internal Error).');
  }

  if (operation.response?.generatedVideos?.length > 0) {
    const videoUri = operation.response.generatedVideos[0].video?.uri;
    if (!videoUri) throw new Error('API returned success but no video URI.');

    // 4. Download Video
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
        throw new Error(`Failed to download generated video: ${downloadError.message}`);
    }
  } else {
    throw new Error('No videos returned in response.');
  }
};