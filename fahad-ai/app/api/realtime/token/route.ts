import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const googleApiKey = process.env.GOOGLE_API_KEY;
    
    if (!googleApiKey) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    // Generate a short-lived token for Gemini Realtime API
    // In a real implementation, you would call Google's token generation endpoint
    // For now, we'll create a mock token that includes the API key
    const token = Buffer.from(JSON.stringify({
      apiKey: googleApiKey,
      timestamp: Date.now(),
      expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
    })).toString('base64');

    return NextResponse.json({ 
      token,
      expiresAt: Date.now() + (60 * 60 * 1000)
    });
  } catch (error) {
    console.error('Failed to generate token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}