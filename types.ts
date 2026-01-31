
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Global augmentation for the AI Studio environment injection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export enum AppView {
  FEED = 'feed',
  AVATARS = 'avatars',
  HISTORY = 'history',
  SETTINGS = 'settings',
  INTEGRATIONS = 'integrations'
}

export enum VeoModel {
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO = 'veo-3.1-generate-preview',
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
}

export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  REFERENCES_TO_VIDEO = 'References to Video',
}

export interface ImageFile {
  file: File;
  base64: string;
}

export interface VideoFile {
  file: File;
  base64: string;
}

export interface GenerateVideoParams {
  prompt: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  mode: GenerationMode;
  startFrame?: ImageFile | null;
  endFrame?: ImageFile | null;
  referenceImages?: ImageFile[];
  styleImage?: ImageFile | null;
  inputVideo?: VideoFile | null;
  isLooping?: boolean;
}

export enum PostStatus {
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface FeedPost {
  id: string;
  videoUrl?: string;
  username: string;
  avatarUrl: string;
  description: string;
  modelTag: string;
  status?: PostStatus;
  errorMessage?: string;
  referenceImageBase64?: string;
}

export interface CameoImage {
  id: string;
  url: string; // Data URL
  base64: string;
}

export interface CameoProfile {
  id: string;
  name: string;
  images: CameoImage[]; // Multiple images for better character understanding
}

export enum IntegrationType {
    DISCORD = 'discord',
    YOUTUBE = 'youtube',
    TIKTOK = 'tiktok',
    INSTAGRAM = 'instagram',
    ZAPIER = 'zapier',
    WEBHOOK = 'webhook'
}

export interface IntegrationConfig {
    id: IntegrationType;
    name: string;
    isEnabled: boolean;
    config: {
        webhookUrl?: string; // For Discord, Zapier, Webhook
        accessToken?: string; // For others (mocked for now)
        channelId?: string;
    };
    lastSync?: number;
}
