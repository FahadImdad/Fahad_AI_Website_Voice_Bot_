# Deployment Guide - Fahad AI

## Prerequisites

Before deploying, ensure you have:

1. **Google AI Studio API Key**
   - Visit: https://aistudio.google.com/app/apikey
   - Create a new API key
   - Enable Gemini API access

2. **Tavily API Key**
   - Visit: https://tavily.com/
   - Sign up for an account
   - Get your API key from the dashboard

## Vercel Deployment (Recommended)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy to Vercel
```bash
# From the project root
vercel --prod
```

### 3. Set Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
GOOGLE_API_KEY=your_actual_google_api_key
TAVILY_API_KEY=your_actual_tavily_api_key
```

### 4. Redeploy
After adding environment variables, trigger a new deployment:
```bash
vercel --prod
```

## Manual Deployment

### 1. Build the Project
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. Environment Setup
Make sure your hosting platform supports:
- Node.js 18+
- Environment variables
- Serverless functions (for API routes)

## Testing Deployment

1. **Access the Application**
   - Visit your deployed URL
   - You should see "Say Hi Fahad to begin"

2. **Test Voice Features**
   - Grant microphone permissions when prompted
   - Say "Hi Fahad" to start a session
   - Ask questions about Fahad's work
   - Say "Bye Fahad" or wait 20 seconds to end

3. **Test API Endpoints**
   - `/api/realtime/token` should return a token
   - `/api/websearch` should search fahadimdad.com
   - `/api/preview` should fetch page content

## Troubleshooting

### Common Issues

1. **Microphone Not Working**
   - Ensure HTTPS is enabled (required for microphone access)
   - Check browser permissions
   - Test on Chrome/Edge for best compatibility

2. **API Errors**
   - Verify environment variables are set correctly
   - Check API key validity
   - Ensure CORS settings allow your domain

3. **Build Failures**
   - Run `npm install` to ensure all dependencies
   - Check Node.js version (18+ required)
   - Verify TypeScript compilation with `npm run build`

### Performance Optimization

1. **Enable Edge Functions** (Vercel)
   - API routes can use Edge Runtime for faster cold starts
   - Add `export const runtime = 'edge'` to API routes if needed

2. **Caching**
   - Page preview API includes 24-hour caching
   - Consider adding CDN caching for static assets

## Security Notes

- API keys are kept secure on the server side
- Only fahadimdad.com content is accessible via search
- Short-lived tokens for Gemini Realtime access
- No client-side API key exposure

## Browser Support

- **Chrome/Edge**: Full support with WebRTC
- **Firefox**: Limited WebRTC support
- **Safari**: Requires user gesture for microphone
- **Mobile**: Limited support due to WebRTC constraints

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Vercel Analytics)
- Performance monitoring
- API usage tracking