# 🎬 Krauz - AI Video Generation Studio

> Powerful AI-powered video generation platform with multi-provider API key management

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/savorsem/krauz)

## ✨ Key Features

### 🎨 Modern & Intuitive Interface
- Beautiful gradient UI with smooth animations
- Swipe navigation between views
- Real-time video generation status
- Mobile-responsive design

### 🔑 Advanced API Key Management
**NEW: No Google Cloud Account Required!**

- **Local Storage Only** - Your API keys stay in your browser, never sent to servers
- **Multi-Provider Support**:
  - 🤖 Google Gemini (Video & Text Generation)
  - 🧠 OpenAI (GPT Models)
  - 🎭 Anthropic Claude
  - 🎨 Replicate (AI Models)
  - 🖼️ Stability AI (Image Generation)
  - ➕ Custom Providers

- **Easy Management**:
  - Enable/disable providers instantly
  - Secure key visibility toggle
  - Add your own custom AI providers
  - No server-side storage required

### 🎯 Smart Features
- Video generation with customizable prompts
- History tracking
- Avatar management
- PWA support for offline access

## 🚀 Quick Start

### 1. Get Your API Key

#### Google Gemini (Recommended)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

#### OpenAI (Optional)
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy the key

#### Other Providers
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)
- **Replicate**: [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
- **Stability AI**: [platform.stability.ai](https://platform.stability.ai/)

### 2. Configure in App

1. Open the app at [v0-krauz.vercel.app](https://v0-krauz.vercel.app)
2. Click on **Settings** ⚙️ (or menu icon)
3. Go to **"API Keys"** tab
4. Select your preferred provider
5. ✅ Enable the provider
6. 🔑 Enter your API key
7. 💾 Click "Save Settings"

That's it! No Google Cloud account or complex setup needed.

## 💻 Local Development

```bash
# Clone repository
git clone https://github.com/savorsem/krauz.git
cd krauz

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 📁 Project Structure

```
krauz/
├── components/
│   ├── EnhancedSettingsDrawer.tsx  # 🆕 API Key Management
│   ├── ApiKeyDialog.tsx            # Legacy key dialog
│   ├── SideMenu.tsx                # Navigation menu
│   ├── VideoCard.tsx               # Video display
│   ├── VideoEditor.tsx             # Video editing
│   ├── BottomPromptBar.tsx         # Prompt input
│   └── Views.tsx                   # Main views
├── services/
│   └── geminiService.ts            # Gemini AI integration
├── utils/
│   ├── db.ts                       # Local data management
│   └── envUtils.ts                 # Environment utilities
├── App.tsx                         # Main app component
└── types.ts                        # TypeScript definitions
```

## 🔐 Security & Privacy

### Data Storage
- ✅ **API keys**: Stored in browser's localStorage only
- ✅ **Videos**: Stored locally in IndexedDB
- ✅ **Settings**: Stored locally in localStorage
- ❌ **Never sent to our servers**: All data stays on your device

### Best Practices
1. Use HTTPS in production (automatic with Vercel)
2. Don't share your API keys
3. Regularly rotate your API keys
4. Use different keys for development and production

## 🛠️ Configuration

### Environment Variables (Optional)

You can set default values via environment variables:

```env
# .env.local
VITE_GEMINI_API_KEY=your_key_here  # Optional default
```

**Note**: Users can override these in Settings without needing access to environment variables.

## 📦 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/savorsem/krauz)

1. Click the button above
2. Connect your GitHub account
3. Deploy
4. Your app will be live in minutes!

### Manual Deployment

```bash
# Build for production
npm run build

# Preview build locally
npm run preview

# Deploy dist/ folder to your hosting
```

## 🎨 Customization

### Adding Custom AI Providers

1. Open Settings → API Keys
2. Click "Add Custom Provider"
3. Enter provider details:
   - Name
   - API Key
   - Description
4. Save Settings

Your custom provider will be saved locally and available for use.

### Theme Customization

Coming soon in Settings → Appearance!

## 🐛 Troubleshooting

### "No API key configured"
**Solution**: 
1. Open Settings ⚙️
2. Go to API Keys tab
3. Enable at least one provider
4. Enter valid API key
5. Click Save

### "API request failed"
**Possible causes**:
- Invalid or expired API key
- Insufficient API quota
- Network connectivity issues
- Provider service outage

**Solution**:
1. Verify your API key is correct
2. Check provider's status page
3. Ensure you have remaining quota
4. Try again in a few minutes

### "App not loading"
**Solution**:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors
4. Try in incognito/private mode

## 📚 API Documentation

### Google Gemini
- [Documentation](https://ai.google.dev/docs)
- [Pricing](https://ai.google.dev/pricing)
- [Quota Limits](https://ai.google.dev/gemini-api/docs/quota)

### OpenAI
- [Documentation](https://platform.openai.com/docs)
- [Pricing](https://openai.com/pricing)

### Anthropic
- [Documentation](https://docs.anthropic.com/)
- [Pricing](https://www.anthropic.com/pricing)

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations with [Framer Motion](https://www.framer.com/motion/)
- Powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Deployed on [Vercel](https://vercel.com/)

## 📧 Support

Need help? Have questions?

- 📖 [Read the docs](https://github.com/savorsem/krauz/wiki)
- 🐛 [Report issues](https://github.com/savorsem/krauz/issues)
- 💬 [Discussions](https://github.com/savorsem/krauz/discussions)

---

Made with ❤️ by the Krauz team
