import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

// Simple in-memory cache for 24 hours
const cache = new Map<string, { content: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate that URL is from fahadimdad.com
    if (!url.includes('fahadimdad.com')) {
      return NextResponse.json(
        { error: 'Only fahadimdad.com URLs are allowed' },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        url,
        content: cached.content,
        cached: true
      });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Fahad AI Assistant Bot 1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse HTML and extract text content
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Get text content from main content areas
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '#content',
      '.post-content',
      '.entry-content',
      'body'
    ];
    
    let textContent = '';
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        textContent = element.textContent || '';
        break;
      }
    }
    
    // Clean up the text
    const cleanedContent = textContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Cache the result
    cache.set(url, {
      content: cleanedContent,
      timestamp: Date.now()
    });

    return NextResponse.json({
      url,
      content: cleanedContent,
      cached: false
    });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page content' },
      { status: 500 }
    );
  }
}