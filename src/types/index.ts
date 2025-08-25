// Equipment Analysis Types
export interface Equipment {
  name: string;
  type: 'cardio' | 'strength' | 'flexibility';
  condition: 'good' | 'fair' | 'poor';
  quantity: number;
  weight_range?: string;
}

export interface EquipmentAnalysis {
  equipment: Equipment[];
  space_assessment: string;
  recommended_workout_types: string[];
  safety_considerations: string[];
  missing_equipment_suggestions: string[];
}

// Workout Plan Types
export interface WorkoutSegment {
  id: string;
  exercise: string;
  duration: number;
  equipment: string;
  instructions: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface WorkoutPlan {
  totalDuration: number;
  segments: WorkoutSegment[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus_areas: string[];
}

// Audio Types
export interface AudioSegment {
  id: string;
  audio: Blob | string;
  duration: number;
  exercise: string;
  segment_id: string;
}

// Progress Tracking Types
export interface DailyProgress {
  [date: string]: {
    completed: boolean;
    audioMinutes: number;
    completionPercentage: number;
    timestamp: number;
  };
}

export interface WeeklyStats {
  daysCompleted: number;
  weeklyGoal: number;
  daysRemaining: number;
  weeklyPercentage: number;
  currentWeekDates: string[];
}

export interface UserStats {
  currentStreak: number;
  weeklyStats: WeeklyStats;
  lastUpdated: number;
  totalWorkouts: number;
  totalMinutes: number;
}

// Session Types
export interface WorkoutSession {
  id: string;
  startTime: number;
  endTime?: number;
  audioPlaybackTime: number;
  targetTime: number;
  completed: boolean;
  completionPercentage: number;
  workoutPlan: WorkoutPlan;
  equipmentUsed: Equipment[];
}

// User Profile Types
export interface UserProfile {
  name: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  preferences: {
    workoutDuration: number;
    voiceStyle: 'motivating' | 'calm' | 'energetic';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Context Types
export interface WorkoutContextType {
  currentWorkout: WorkoutSession | null;
  isSessionActive: boolean;
  audioProgress: number;
  equipmentAnalysis: EquipmentAnalysis | null;
  isLoading: boolean;
  error: string | null;
  startWorkout: (workoutPlan: WorkoutPlan, equipment: Equipment[]) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  endWorkout: () => void;
  updateProgress: (progress: number) => void;
  setEquipmentAnalysis: (analysis: EquipmentAnalysis) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface ProgressContextType {
  dailyProgress: DailyProgress;
  userStats: UserStats;
  isLoading: boolean;
  updateDailyProgress: (date: string, progress: any) => void;
  calculateStreak: () => number;
  getWeeklyStats: () => WeeklyStats;
  refreshStats: () => Promise<void>;
}