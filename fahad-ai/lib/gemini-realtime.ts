export interface GeminiRealtimeConfig {
  token: string;
  model: string;
  voice: string;
  systemPrompt: string;
}

export interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

export class GeminiRealtimeClient {
  private isConnected = false;
  private tools: ToolDefinition[] = [
    {
      name: 'web_search_site',
      description: 'Search fahadimdad.com in real-time.',
      parameters: {
        type: 'object',
        properties: {
          q: { type: 'string', description: 'Search query' },
          max: { type: 'number', description: 'Maximum results', default: 5 }
        },
        required: ['q']
      }
    },
    {
      name: 'open_link_preview',
      description: 'Fetch and clean a single page from fahadimdad.com.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to fetch from fahadimdad.com' }
        },
        required: ['url']
      }
    }
  ];
  
  constructor(
    private config: GeminiRealtimeConfig,
    private onMessage: (message: string) => void,
    private onAudioData: (audioData: string) => void,
    private onStateChange: (state: 'connecting' | 'connected' | 'disconnected') => void
  ) {}

  async connect(): Promise<boolean> {
    try {
      this.onStateChange('connecting');
      
      // For this demo, we'll simulate a WebRTC connection
      // In production, this would connect to Gemini's actual WebRTC endpoint
      await this.simulateConnection();
      
      this.isConnected = true;
      this.onStateChange('connected');
      return true;
    } catch (error) {
      console.error('Failed to connect to Gemini Realtime:', error);
      this.onStateChange('disconnected');
      return false;
    }
  }

  private async simulateConnection(): Promise<void> {
    // Simulate WebRTC connection establishment
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Simulated Gemini Realtime connection established');
        resolve();
      }, 1000);
    });
  }

  private async executeToolCall(toolName: string, parameters: Record<string, unknown>): Promise<unknown> {
    try {
      switch (toolName) {
        case 'web_search_site':
          const searchResponse = await fetch('/api/websearch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parameters)
          });
          return await searchResponse.json();

        case 'open_link_preview':
          const previewResponse = await fetch('/api/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parameters)
          });
          return await previewResponse.json();

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`Tool execution failed for ${toolName}:`, error);
      return { error: `Failed to execute ${toolName}` };
    }
  }

  async sendAudioData(_audioData: ArrayBuffer): Promise<void> {
    if (!this.isConnected) return;
    
    // Simulate processing audio input and generating response
    // In production, this would send the audio to Gemini Realtime API
    
    // For demo purposes, simulate a response after a delay
    setTimeout(async () => {
      await this.processUserInput("Hello, tell me about your work");
    }, 1000 + Math.random() * 2000);
  }

  sendTextMessage(text: string): void {
    if (!this.isConnected) return;
    
    // Process the text message
    console.log('Sending text message:', text);
    
    // Simulate response generation
    this.processUserInput(text);
  }

  private async processUserInput(input: string): Promise<void> {
    // Simulate Gemini processing with tool calls
    // In production, this would be handled by the Gemini Realtime API
    
    const needsSearch = input.toLowerCase().includes('work') || 
                       input.toLowerCase().includes('project') ||
                       input.toLowerCase().includes('experience') ||
                       input.toLowerCase().includes('about') ||
                       input.toLowerCase().includes('tell me');
    
    if (needsSearch) {
      try {
        // Simulate tool call to search
        const searchResult = await this.executeToolCall('web_search_site', { 
          q: input,
          max: 3 
        }) as { results?: Array<{ content?: string }> };
        
        let response = "Based on my website, ";
        if (searchResult.results && searchResult.results.length > 0) {
          const content = searchResult.results[0].content || '';
          response += `I found some relevant information: ${content.substring(0, 200)}...`;
        } else {
          response += "I don't have specific details on that topic right now.";
        }
        
        this.onMessage(response);
        this.onAudioData('simulated_audio_response');
      } catch (_error) {
        this.onMessage("I'm having trouble accessing my knowledge base right now. Could you try rephrasing your question?");
        this.onAudioData('simulated_audio_error');
      }
    } else {
      // General responses
      const responses = [
        "Hi there! I'm Fahad, and I'm here to help you with any questions about my work and projects.",
        "That's interesting! Feel free to ask me about my professional experience or recent projects.",
        "I'd be happy to share more about my background and expertise.",
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      this.onMessage(response);
      this.onAudioData('simulated_audio_general');
    }
  }

  disconnect(): void {
    this.isConnected = false;
    this.onStateChange('disconnected');
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

export async function generateRealtimeToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/realtime/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate token');
    }
    
    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error('Failed to generate realtime token:', error);
    return null;
  }
}