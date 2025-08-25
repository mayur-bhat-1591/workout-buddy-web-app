import Groq from 'groq-sdk';
import { API_CONFIG } from '../constants/config';
import { WORKOUT_GENERATION_PROMPT, COACHING_MESSAGE_PROMPTS } from '../constants/prompts';
import { WorkoutPlan, Equipment, UserProfile, ApiResponse } from '../types';

class GroqService {
  private client: Groq;
  private models = API_CONFIG.GROQ.MODELS;

  constructor() {
    this.client = new Groq({
      apiKey: API_CONFIG.GROQ.API_KEY,
      dangerouslyAllowBrowser: true, // Enable for web app usage
    });
  }

  async generateWorkoutPlan(
    equipmentData: Equipment[],
    userProfile: UserProfile
  ): Promise<ApiResponse<WorkoutPlan>> {
    try {
      console.log('🔧 GroqService: Starting workout plan generation');
      console.log('🔧 API Key configured:', !!API_CONFIG.GROQ.API_KEY);
      console.log('🔧 Model to use:', this.models.BALANCED);
      
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: WORKOUT_GENERATION_PROMPT,
          },
          {
            role: 'user',
            content: `
              Available equipment: ${JSON.stringify(equipmentData)}
              User profile: ${JSON.stringify(userProfile)}
              
              Create a ${userProfile.preferences.workoutDuration}-minute workout plan optimized for ${userProfile.fitnessLevel} level.
            `,
          },
        ],
        model: this.models.BALANCED,
        response_format: { type: 'json_object' },
        max_tokens: 2000,
        temperature: 0.7,
      });

      console.log('🔧 Groq API response received:', response);
      const workoutPlan = JSON.parse(response.choices[0].message.content || '{}');
      console.log('🔧 Parsed workout plan:', workoutPlan);
      
      // Add unique IDs to segments if not present
      workoutPlan.segments = workoutPlan.segments.map((segment: any, index: number) => ({
        ...segment,
        id: segment.id || `segment_${index}`,
      }));

      console.log('🔧 Final workout plan with IDs:', workoutPlan);

      return {
        success: true,
        data: workoutPlan,
      };
    } catch (error) {
      console.error('🔧 Groq workout generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔧 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      return {
        success: false,
        data: {} as WorkoutPlan,
        error: `Failed to generate workout plan: ${errorMessage}`,
      };
    }
  }

  async generateCoachingMessage(context: {
    exercise: string;
    timeElapsed: number;
    userEnergy: string;
    progress: number;
  }): Promise<ApiResponse<string>> {
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: COACHING_MESSAGE_PROMPTS.MOTIVATION
              .replace('{exercise}', context.exercise)
              .replace('{timeElapsed}', context.timeElapsed.toString())
              .replace('{userEnergy}', context.userEnergy)
              .replace('{progress}', context.progress.toString()),
          },
        ],
        model: this.models.FAST, // Ultra-fast for real-time
        max_tokens: 50,
        temperature: 0.8,
      });

      return {
        success: true,
        data: response.choices[0].message.content || '',
      };
    } catch (error) {
      console.error('Groq coaching message error:', error);
      return {
        success: false,
        data: '',
        error: 'Failed to generate coaching message',
      };
    }
  }

  async generateCompletionFeedback(sessionData: {
    audioMinutes: number;
    completionPercentage: number;
    weeklyStats: any;
  }): Promise<ApiResponse<string>> {
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: COACHING_MESSAGE_PROMPTS.COMPLETION
              .replace('{audioMinutes}', sessionData.audioMinutes.toString())
              .replace('{completionPercentage}', sessionData.completionPercentage.toString())
              .replace('{weeklyStats}', JSON.stringify(sessionData.weeklyStats)),
          },
        ],
        model: this.models.FAST,
        max_tokens: 100,
        temperature: 0.7,
      });

      return {
        success: true,
        data: response.choices[0].message.content || '',
      };
    } catch (error) {
      console.error('Groq completion feedback error:', error);
      return {
        success: false,
        data: '',
        error: 'Failed to generate completion feedback',
      };
    }
  }

  async generateWelcomeMessage(
    equipmentList: string[],
    userName: string,
    workoutFocus: string
  ): Promise<ApiResponse<string>> {
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: COACHING_MESSAGE_PROMPTS.WELCOME
              .replace('{userName}', userName)
              .replace('{equipmentList}', equipmentList.join(', '))
              .replace('{workoutFocus}', workoutFocus),
          },
        ],
        model: this.models.FAST,
        max_tokens: 100,
        temperature: 0.8,
      });

      return {
        success: true,
        data: response.choices[0].message.content || '',
      };
    } catch (error) {
      console.error('Groq welcome message error:', error);
      return {
        success: false,
        data: '',
        error: 'Failed to generate welcome message',
      };
    }
  }
}

const groqService = new GroqService();
export default groqService;