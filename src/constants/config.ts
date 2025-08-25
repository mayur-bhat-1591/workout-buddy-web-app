export const API_CONFIG = {
  GROQ: {
    API_KEY: process.env.REACT_APP_GROQ_API_KEY || '',
    BASE_URL: process.env.REACT_APP_GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    MODELS: {
      FAST: 'llama-3.1-8b-instant',
      BALANCED: 'openai/gpt-oss-20b',
      REASONING: 'mixtral-8x7b-32768',
    },
  },
  ELEVENLABS: {
    API_KEY: process.env.REACT_APP_ELEVENLABS_API_KEY || '',
    VOICE_ID: process.env.REACT_APP_ELEVENLABS_VOICE_ID || '',
    BASE_URL: process.env.REACT_APP_ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1',
  },
  OPENAI: {
    API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
    BASE_URL: process.env.REACT_APP_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
};

export const APP_CONFIG = {
  NAME: process.env.REACT_APP_NAME || 'WorkoutBuddy',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  WORKOUT_TARGET_MINUTES: parseInt(process.env.REACT_APP_WORKOUT_TARGET_MINUTES || '45'),
  WEEKLY_GOAL_DAYS: parseInt(process.env.REACT_APP_WEEKLY_GOAL_DAYS || '5'),
  COMPLETION_THRESHOLD: 0.8, // 80% completion required for daily goal
};

export const STORAGE_KEYS = {
  DAILY_PROGRESS: 'workoutbuddy_daily_progress',
  USER_STATS: 'workoutbuddy_user_stats',
  USER_PROFILE: 'workoutbuddy_user_profile',
  WORKOUT_HISTORY: 'workoutbuddy_workout_history',
};

export const VIDEO_CONFIG = {
  MAX_DURATION: 30, // seconds
  FRAME_RATE: 30,
  QUALITY: 'high' as const,
  FORMATS: ['mp4', 'webm'] as const,
};

export const AUDIO_CONFIG = {
  SAMPLE_RATE: 44100,
  CHANNELS: 1,
  BITRATE: 128,
  FORMAT: 'mp3' as const,
};