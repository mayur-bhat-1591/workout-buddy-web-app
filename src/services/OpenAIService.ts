import OpenAI from 'openai';
import { API_CONFIG } from '../constants/config';
import { EQUIPMENT_ANALYSIS_PROMPT } from '../constants/prompts';
import { EquipmentAnalysis, ApiResponse } from '../types';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: API_CONFIG.OPENAI.API_KEY,
      dangerouslyAllowBrowser: true, // Enable for web app usage
    });
  }

  async analyzeEquipmentVideo(videoFrames: string[]): Promise<ApiResponse<EquipmentAnalysis>> {
    try {
      // Check if API is configured
      if (!this.isConfigured()) {
        console.warn('OpenAI API not configured, using mock data');
        return {
          success: true,
          data: this.createMockAnalysis(),
        };
      }

      console.log('Starting OpenAI video analysis with', videoFrames.length, 'frames');
      
      // Test API connection first with a simple request
      try {
        const testResponse = await this.client.chat.completions.create({
          model: 'gpt-4o-mini', // Use cheaper model for testing
          messages: [
            {
              role: 'user',
              content: 'Test connection. Respond with "OK".',
            },
          ],
          max_tokens: 10,
        });
        console.log('OpenAI API connection test successful:', testResponse.choices[0].message.content);
      } catch (testError) {
        console.warn('OpenAI API connection test failed, using mock data:', testError);
        return {
          success: true,
          data: this.createMockAnalysis(),
        };
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: EQUIPMENT_ANALYSIS_PROMPT,
              },
              ...videoFrames.map((frame) => ({
                type: 'image_url' as const,
                image_url: {
                  url: frame,
                  detail: 'high' as const,
                },
              })),
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      console.log('OpenAI analysis successful:', analysis);

      return {
        success: true,
        data: analysis,
      };
    } catch (error) {
      console.error('OpenAI Video Analysis Error:', error);
      console.log('Falling back to mock equipment analysis');
      
      // Return mock data as fallback
      return {
        success: true,
        data: this.createMockAnalysis(),
      };
    }
  }

  async extractVideoFrames(videoFile: File, frameCount: number = 5): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const frames: string[] = [];
      let currentFrame = 0;

      video.addEventListener('loadedmetadata', () => {
        const videoDuration = video.duration;
        
        // Validate video duration
        if (!isFinite(videoDuration) || videoDuration <= 0) {
          reject(new Error('Invalid video duration'));
          return;
        }
        
        const interval = videoDuration / (frameCount + 1);

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const extractFrame = () => {
          if (currentFrame >= frameCount) {
            resolve(frames);
            return;
          }

          const timestamp = interval * (currentFrame + 1);
          
          // Validate timestamp before setting currentTime
          if (!isFinite(timestamp) || timestamp < 0 || timestamp > videoDuration) {
            console.warn(`Invalid timestamp: ${timestamp}, skipping frame ${currentFrame}`);
            currentFrame++;
            if (currentFrame < frameCount) {
              setTimeout(extractFrame, 100);
            } else {
              resolve(frames);
            }
            return;
          }
          
          video.currentTime = timestamp;
        };

        video.addEventListener('seeked', () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          frames.push(frameDataUrl);
          currentFrame++;
          
          if (currentFrame < frameCount) {
            setTimeout(extractFrame, 100); // Small delay between frame extractions
          } else {
            resolve(frames);
          }
        });

        extractFrame();
      });

      video.addEventListener('error', (e) => {
        reject(new Error('Video loading failed'));
      });

      video.src = URL.createObjectURL(videoFile);
    });
  }

  async analyzeEquipmentFromImages(imageFiles: File[]): Promise<ApiResponse<EquipmentAnalysis>> {
    try {
      const imageDataUrls = await Promise.all(
        imageFiles.map((file) => this.fileToDataUrl(file))
      );

      return await this.analyzeEquipmentVideo(imageDataUrls);
    } catch (error) {
      console.error('Error analyzing equipment from images:', error);
      return {
        success: false,
        data: {} as EquipmentAnalysis,
        error: 'Failed to analyze equipment from images',
      };
    }
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Validate API configuration
  isConfigured(): boolean {
    return !!API_CONFIG.OPENAI.API_KEY;
  }

  // Create mock equipment analysis for demo purposes
  createMockAnalysis(): EquipmentAnalysis {
    return {
      equipment: [
        {
          name: 'Dumbbells',
          type: 'strength',
          condition: 'good',
          quantity: 2,
          weight_range: '10-50 lbs',
        },
        {
          name: 'Yoga Mat',
          type: 'flexibility',
          condition: 'good',
          quantity: 1,
        },
        {
          name: 'Resistance Bands',
          type: 'strength',
          condition: 'good',
          quantity: 3,
        },
      ],
      space_assessment: 'Medium-sized home gym with good ventilation and floor space for various exercises',
      recommended_workout_types: ['Strength Training', 'HIIT', 'Flexibility', 'Full Body'],
      safety_considerations: ['Ensure proper form with dumbbells', 'Secure resistance bands properly'],
      missing_equipment_suggestions: ['Pull-up bar', 'Kettlebell', 'Exercise bench'],
    };
  }
}

const openAIService = new OpenAIService();
export default openAIService;