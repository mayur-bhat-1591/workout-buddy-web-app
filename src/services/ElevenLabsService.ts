import { API_CONFIG } from '../constants/config';
import { VOICE_SETTINGS } from '../constants/prompts';
import { WorkoutPlan, AudioSegment, ApiResponse } from '../types';

class ElevenLabsService {
  private apiKey = API_CONFIG.ELEVENLABS.API_KEY;
  private voiceId = API_CONFIG.ELEVENLABS.VOICE_ID;
  private baseUrl = API_CONFIG.ELEVENLABS.BASE_URL;
  private voiceSettings = VOICE_SETTINGS;

  async generateCoachingAudio(
    text: string,
    intensity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<ApiResponse<Blob>> {
    try {
      const voiceSettings = {
        ...this.voiceSettings,
        style: VOICE_SETTINGS.INTENSITY_STYLES[intensity],
      };

      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5', // Fastest model
          voice_settings: voiceSettings,
          output_format: 'mp3_44100_128',
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();

      return {
        success: true,
        data: audioBlob,
      };
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      return {
        success: false,
        data: new Blob(),
        error: 'Failed to generate audio',
      };
    }
  }

  async generateWorkoutSequence(workoutPlan: WorkoutPlan): Promise<ApiResponse<AudioSegment[]>> {
    try {
      const audioSegments: AudioSegment[] = [];

      for (const segment of workoutPlan.segments) {
        const audioResponse = await this.generateCoachingAudio(
          segment.instructions,
          segment.intensity
        );

        if (audioResponse.success) {
          audioSegments.push({
            id: segment.id,
            audio: audioResponse.data,
            duration: segment.duration * 60 * 1000, // Convert to milliseconds
            exercise: segment.exercise,
            segment_id: segment.id,
          });
        } else {
          console.warn(`Failed to generate audio for segment: ${segment.exercise}`);
          // Create fallback audio or handle error
          audioSegments.push({
            id: segment.id,
            audio: new Blob(),
            duration: segment.duration * 60 * 1000,
            exercise: segment.exercise,
            segment_id: segment.id,
          });
        }
      }

      return {
        success: true,
        data: audioSegments,
      };
    } catch (error) {
      console.error('Error generating workout sequence:', error);
      return {
        success: false,
        data: [],
        error: 'Failed to generate workout audio sequence',
      };
    }
  }

  async generateWelcomeAudio(
    equipmentList: string[],
    userName: string
  ): Promise<ApiResponse<Blob>> {
    const welcomeText = `Hey ${userName}! I can see you have ${equipmentList.join(', ')}. 
                        Perfect! I've created an amazing 45-minute workout just for you. 
                        This is going to count toward your weekly goal. Ready to crush this?`;

    return await this.generateCoachingAudio(welcomeText, 'high');
  }

  // Convert blob to audio URL for playback
  createAudioUrl(audioBlob: Blob): string {
    return URL.createObjectURL(audioBlob);
  }

  // Clean up audio URLs to prevent memory leaks
  revokeAudioUrl(audioUrl: string): void {
    URL.revokeObjectURL(audioUrl);
  }

  // Get estimated audio duration (approximation based on text length)
  estimateAudioDuration(text: string): number {
    // Average speaking rate is ~150 words per minute
    const wordsPerMinute = 150;
    const wordCount = text.split(' ').length;
    return Math.ceil((wordCount / wordsPerMinute) * 60 * 1000); // Convert to milliseconds
  }

  // Validate API configuration
  isConfigured(): boolean {
    return !!(this.apiKey && this.voiceId);
  }
}

const elevenLabsService = new ElevenLabsService();
export default elevenLabsService;