# Fahad AI - Realtime Voice Assistant

A deployable Next.js 14 app for Vercel. Fahad AI is a realtime voice-first assistant that speaks as Muhammad Fahad Imdad (first person). It features a cinematic black-and-white UI, uses Gemini Realtime API for speech in/out, and fetches live knowledge only from fahadimdad.com via Tavily.

## Features

- **Voice-First Interface**: Wake with "Hi Fahad", exit with "Bye Fahad" or 20s silence
- **Realtime Speech**: Gemini Realtime API with WebRTC for natural conversation
- **Knowledge Grounded**: Only answers from fahadimdad.com content via Tavily search
- **Cinematic UI**: Black background, white text, smooth Framer Motion animations
- **State Machine**: idle → listening → speaking → ended with visual feedback

## Tech Stack

- **Frontend**: Next.js 14 (App Router, TypeScript), Tailwind CSS, Framer Motion
- **Backend**: Serverless API routes (Vercel-compatible)
- **AI**: Gemini 1.5 Pro Realtime with male voice preset
- **Search**: Tavily API scoped to site:fahadimdad.com
- **Audio**: Web Audio API, getUserMedia, AudioWorklet

## Setup

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your API keys:
   ```bash
   cp .env.example .env.local
   ```
   
   Required keys:
   - `GOOGLE_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - `TAVILY_API_KEY`: Get from [Tavily](https://tavily.com/)

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables**:
   In your Vercel dashboard, add:
   - `GOOGLE_API_KEY`
   - `TAVILY_API_KEY`

3. **Domain**: The app will be available at your Vercel domain

## Usage

1. **Start Session**: Say "Hi Fahad" to begin
2. **Ask Questions**: Speak naturally about Fahad's work, projects, or experience
3. **End Session**: Say "Bye Fahad" or wait 20 seconds of silence
4. **Visual States**:
   - **Idle**: Pulsing "Say Hi Fahad to begin"
   - **Listening**: Animated circle with audio level visualization
   - **Speaking**: Equalizer bars with response text
   - **Ended**: "Session ended" with fade transition

## API Routes

- `/api/realtime/token`: Generates secure token for Gemini Realtime
- `/api/websearch`: Proxy to Tavily API scoped to fahadimdad.com
- `/api/preview`: Fetches and cleans pages from fahadimdad.com

## Architecture

```
app/
├── page.tsx              # Main UI with state machine
├── layout.tsx            # Root layout with fonts and metadata
├── globals.css           # Black/white theme and animations
└── api/
    ├── realtime/token/   # Gemini token generation
    ├── websearch/        # Tavily search proxy
    └── preview/          # HTML content fetcher

lib/
├── audio.ts              # Mic capture, silence detection, playback
└── gemini-realtime.ts    # WebRTC integration with Gemini
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Limited WebRTC support
- **Safari**: Requires user gesture for microphone access

## Security

- API keys stored securely in environment variables
- CORS protection on API routes
- Content restricted to fahadimdad.com domain
- Short-lived tokens for Gemini Realtime access

## Performance

- Serverless functions for scalability
- 24-hour caching for page previews
- Optimized audio processing at 16kHz mono
- Framer Motion for smooth 60fps animations

## License

Built for Muhammad Fahad Imdad's personal AI assistant project.