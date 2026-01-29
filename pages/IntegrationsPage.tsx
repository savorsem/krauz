/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { 
  Plug, 
  Check, 
  ExternalLink, 
  Settings2, 
  Zap,
  Video,
  Mic,
  Cloud,
  Database,
  Bot,
  Sparkles
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  connected: boolean;
  status?: string;
}

const integrations: Integration[] = [
  {
    id: 'heygen',
    name: 'HeyGen',
    description: 'AI avatar video generation with realistic digital humans',
    icon: Video,
    category: 'Video',
    connected: false,
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'AI voice cloning and text-to-speech synthesis',
    icon: Mic,
    category: 'Audio',
    connected: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps and automate workflows',
    icon: Zap,
    category: 'Automation',
    connected: true,
    status: 'Connected via MCP',
  },
  {
    id: 'google-ai',
    name: 'Google AI (Veo)',
    description: 'Advanced video generation with Google Veo models',
    icon: Sparkles,
    category: 'AI',
    connected: true,
    status: 'API Key Required',
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Cloud storage for your video assets and renders',
    icon: Cloud,
    category: 'Storage',
    connected: false,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database and authentication for your projects',
    icon: Database,
    category: 'Database',
    connected: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT models for script generation and content planning',
    icon: Bot,
    category: 'AI',
    connected: false,
  },
];

const categories = ['All', 'Video', 'Audio', 'AI', 'Storage', 'Database', 'Automation'];

const IntegrationsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [connectedIntegrations, setConnectedIntegrations] = useState<Record<string, boolean>>(
    integrations.reduce((acc, i) => ({ ...acc, [i.id]: i.connected }), {})
  );

  const handleConnect = (id: string) => {
    setConnectedIntegrations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredIntegrations = integrations.filter(
    i => selectedCategory === 'All' || i.category === selectedCategory
  );

  const connectedCount = Object.values(connectedIntegrations).filter(Boolean).length;

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="max-w-6xl mx-auto p-4 md:p-6 md:pl-24 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect external services to enhance your video creation workflow
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-2xl font-bold text-foreground">{connectedCount}</p>
            <p className="text-sm text-muted-foreground">Connected</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-2xl font-bold text-foreground">{integrations.length - connectedCount}</p>
            <p className="text-sm text-muted-foreground">Available</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-2xl font-bold text-foreground">{categories.length - 1}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-2xl font-bold text-foreground">{integrations.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid gap-4">
          {filteredIntegrations.map((integration) => {
            const Icon = integration.icon;
            const isConnected = connectedIntegrations[integration.id];

            return (
              <div
                key={integration.id}
                className={`flex items-center gap-4 p-4 bg-card border rounded-xl transition-all ${
                  isConnected ? 'border-primary/50' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isConnected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{integration.name}</h3>
                    {isConnected && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{integration.description}</p>
                  {integration.status && (
                    <p className="text-xs text-muted-foreground mt-1">{integration.status}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleConnect(integration.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isConnected
                        ? 'bg-muted text-foreground hover:bg-muted/80'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                  {isConnected && (
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Settings2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* HeyGen/Zapier Special Section */}
        <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">HeyGen via Zapier MCP</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create AI avatar videos directly through our Zapier integration. Generate professional 
                videos with realistic digital humans, custom voices, and automatic lip-sync.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Avatar Videos</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">WebM Export</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Templates</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Translation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
