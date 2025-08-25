import { APP_CONFIG, STORAGE_KEYS } from '../constants/config';
import { DailyProgress, WeeklyStats, UserStats } from '../types';

class AudioTracker {
  private audioPlaybackTime = 0;
  private sessionStartTime: number | null = null;
  private trackingInterval: NodeJS.Timeout | null = null;
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;
  private onProgressUpdate: ((progress: any) => void) | null = null;

  startSession(): void {
    this.sessionStartTime = Date.now();
    this.audioPlaybackTime = 0;
    this.isPlaying = false;
  }

  startPlaybackTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    this.trackingInterval = setInterval(() => {
      if (this.isPlaying) {
        this.audioPlaybackTime += 1000; // Add 1 second
        this.notifyProgressUpdate();
      }
    }, 1000);
  }

  onAudioPlay(): void {
    this.isPlaying = true;
  }

  onAudioPause(): void {
    this.isPlaying = false;
  }

  onAudioEnd(): void {
    this.isPlaying = false;
    this.checkWorkoutCompletion();
  }

  setProgressCallback(callback: (progress: any) => void): void {
    this.onProgressUpdate = callback;
  }

  checkWorkoutCompletion(): {
    completed: boolean;
    audioPlaybackMinutes: number;
    targetMinutes: number;
    completionPercentage: number;
    date: string;
    timestamp: number;
  } {
    const targetTime = APP_CONFIG.WORKOUT_TARGET_MINUTES * 60 * 1000;
    const completionThreshold = targetTime * APP_CONFIG.COMPLETION_THRESHOLD;
    
    const workoutCompleted = this.audioPlaybackTime >= completionThreshold;
    const playedMinutes = Math.round(this.audioPlaybackTime / 60000);
    const completionPercentage = Math.round((this.audioPlaybackTime / targetTime) * 100);

    const sessionResult = {
      completed: workoutCompleted,
      audioPlaybackMinutes: playedMinutes,
      targetMinutes: APP_CONFIG.WORKOUT_TARGET_MINUTES,
      completionPercentage: completionPercentage,
      date: new Date().toDateString(),
      timestamp: Date.now(),
    };

    if (workoutCompleted) {
      this.markDailyGoalComplete(sessionResult);
    }

    return sessionResult;
  }

  async markDailyGoalComplete(sessionResult: any): Promise<DailyProgress> {
    try {
      const today = new Date().toDateString();
      
      // Get existing progress
      const existingProgress = localStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
      const progressData: DailyProgress = existingProgress ? JSON.parse(existingProgress) : {};
      
      // Update today's progress
      progressData[today] = {
        completed: true,
        audioMinutes: sessionResult.audioPlaybackMinutes,
        completionPercentage: sessionResult.completionPercentage,
        timestamp: sessionResult.timestamp,
      };
      
      // Save updated progress
      localStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(progressData));
      
      // Update streak and weekly stats
      await this.updateStreakAndStats(progressData);
      
      return progressData;
    } catch (error) {
      console.error('Error saving daily progress:', error);
      throw error;
    }
  }

  async updateStreakAndStats(progressData: DailyProgress): Promise<UserStats> {
    const currentStreak = this.calculateCurrentStreak(progressData);
    const weeklyStats = this.calculateWeeklyStats(progressData);
    
    // Calculate total stats
    const totalWorkouts = Object.values(progressData).filter(day => day.completed).length;
    const totalMinutes = Object.values(progressData).reduce((sum, day) => sum + day.audioMinutes, 0);
    
    const statsData: UserStats = {
      currentStreak,
      weeklyStats,
      totalWorkouts,
      totalMinutes,
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(statsData));
    return statsData;
  }

  calculateCurrentStreak(progressData: DailyProgress): number {
    const sortedDates = Object.keys(progressData)
      .filter(date => progressData[date].completed)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Most recent first
    
    let streak = 0;
    const today = new Date();
    
    for (const dateString of sortedDates) {
      const progressDate = new Date(dateString);
      const daysDifference = Math.floor((today.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference === streak) {
        streak++;
      } else if (daysDifference > streak) {
        break;
      }
    }
    
    return streak;
  }

  calculateWeeklyStats(progressData: DailyProgress): WeeklyStats {
    const currentWeekDates = this.getCurrentWeekDates();
    const completedThisWeek = currentWeekDates.filter(date => 
      progressData[date] && progressData[date].completed
    ).length;
    
    const weeklyGoal = APP_CONFIG.WEEKLY_GOAL_DAYS;
    
    return {
      daysCompleted: completedThisWeek,
      weeklyGoal: weeklyGoal,
      daysRemaining: Math.max(0, weeklyGoal - completedThisWeek),
      weeklyPercentage: Math.round((completedThisWeek / weeklyGoal) * 100),
      currentWeekDates: currentWeekDates,
    };
  }

  getCurrentWeekDates(): string[] {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.toDateString());
    }
    
    return weekDates;
  }

  notifyProgressUpdate(): void {
    const progress = {
      audioPlaybackTime: this.audioPlaybackTime,
      playedMinutes: Math.round(this.audioPlaybackTime / 60000),
      targetMinutes: APP_CONFIG.WORKOUT_TARGET_MINUTES,
      completionPercentage: Math.round((this.audioPlaybackTime / (APP_CONFIG.WORKOUT_TARGET_MINUTES * 60 * 1000)) * 100),
    };
    
    if (this.onProgressUpdate) {
      this.onProgressUpdate(progress);
    }
  }

  stopTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    this.isPlaying = false;
  }

  getCurrentProgress(): {
    audioPlaybackTime: number;
    playedMinutes: number;
    targetMinutes: number;
    completionPercentage: number;
    isPlaying: boolean;
  } {
    return {
      audioPlaybackTime: this.audioPlaybackTime,
      playedMinutes: Math.round(this.audioPlaybackTime / 60000),
      targetMinutes: APP_CONFIG.WORKOUT_TARGET_MINUTES,
      completionPercentage: Math.round((this.audioPlaybackTime / (APP_CONFIG.WORKOUT_TARGET_MINUTES * 60 * 1000)) * 100),
      isPlaying: this.isPlaying,
    };
  }

  // Get stored progress data
  getDailyProgress(): DailyProgress {
    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
    return stored ? JSON.parse(stored) : {};
  }

  getUserStats(): UserStats | null {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    return stored ? JSON.parse(stored) : null;
  }

  // Reset all progress (for testing/demo purposes)
  resetProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.DAILY_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.USER_STATS);
    this.audioPlaybackTime = 0;
    this.sessionStartTime = null;
    this.stopTracking();
  }
}

const audioTracker = new AudioTracker();
export default audioTracker;