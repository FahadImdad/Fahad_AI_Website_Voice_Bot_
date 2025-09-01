import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { q, max = 5 } = await request.json();
    
    if (!q) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const tavilyApiKey = process.env.TAVILY_API_KEY;
    
    if (!tavilyApiKey) {
      return NextResponse.json(
        { error: 'Tavily API key not configured' },
        { status: 500 }
      );
    }

    // Search only within fahadimdad.com using Tavily API
    const searchQuery = `site:fahadimdad.com ${q}`;
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tavilyApiKey}`,
      },
      body: JSON.stringify({
        query: searchQuery,
        max_results: max,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false,
        exclude_domains: [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter results to ensure they're from fahadimdad.com
    const filteredResults = data.results?.filter((result: { url?: string }) => 
      result.url && result.url.includes('fahadimdad.com')
    ) || [];

    return NextResponse.json({
      query: q,
      results: filteredResults.map((result: { title?: string; url?: string; content?: string; score?: number }) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}