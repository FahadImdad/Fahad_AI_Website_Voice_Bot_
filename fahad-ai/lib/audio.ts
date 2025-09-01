export type SessionState = 'idle' | 'listening' | 'speaking' | 'ended';

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bufferSize: number;
}

export class AudioManager {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private silenceTimer: NodeJS.Timeout | null = null;
  private isListening = false;
  
  private readonly SILENCE_THRESHOLD = 0.01;
  private readonly SILENCE_DURATION = 20000; // 20 seconds
  private readonly SAMPLE_RATE = 16000;

  constructor(
    private onSilenceDetected: () => void,
    private onAudioLevel: (level: number) => void
  ) {}

  async initializeMicrophone(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioContext = new AudioContext({ sampleRate: this.SAMPLE_RATE });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      source.connect(this.analyser);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize microphone:', error);
      return false;
    }
  }

  startListening(): void {
    if (!this.analyser || this.isListening) return;
    
    this.isListening = true;
    this.monitorAudio();
  }

  stopListening(): void {
    this.isListening = false;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private monitorAudio(): void {
    if (!this.isListening || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkAudio = () => {
      if (!this.isListening) return;
      
      this.analyser!.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedLevel = average / 255;
      
      this.onAudioLevel(normalizedLevel);
      
      // Check for silence
      if (normalizedLevel < this.SILENCE_THRESHOLD) {
        if (!this.silenceTimer) {
          this.silenceTimer = setTimeout(() => {
            this.onSilenceDetected();
          }, this.SILENCE_DURATION);
        }
      } else {
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
      }
      
      requestAnimationFrame(checkAudio);
    };
    
    checkAudio();
  }

  async playAudioFromBase64(base64Audio: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Decode base64 to array buffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();

      return new Promise((resolve) => {
        source.onended = () => resolve();
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }

  getAudioStream(): MediaStream | null {
    return this.mediaStream;
  }

  cleanup(): void {
    this.stopListening();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
  }
}

export function detectWakeWord(text: string): boolean {
  const normalizedText = text.toLowerCase().trim();
  return normalizedText.includes('hi fahad') || normalizedText.includes('hey fahad');
}

export function detectExitTrigger(text: string): boolean {
  const normalizedText = text.toLowerCase().trim();
  return normalizedText.includes('bye fahad') || normalizedText.includes('goodbye fahad');
}