/**
 * Audio accessibility helper for Shram Setu
 * Provides text-to-speech audio narration in Hindi or Indian English
 * for daily wage laborers, masons, and helpers.
 */

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private listeners: ((speaking: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(callback: (speaking: boolean) => void): () => void {
    this.listeners.push(callback);
    callback(this.isSpeaking);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((cb) => cb(speaking));
  }

  public speak(text: string, lang: 'hi-IN' | 'en-IN' | 'en-US' = 'hi-IN'): void {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel existing speech
    this.synth.cancel();

    const cleanText = text.replace(/[*_#]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Slightly slower for clear comprehension
    utterance.pitch = 1.0;
    utterance.lang = lang;

    // Pick appropriate voice if available
    const voices = this.synth.getVoices();
    const targetVoice = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.notify(false);
    };

    utterance.onerror = () => {
      this.notify(false);
    };

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speech = new SpeechService();
