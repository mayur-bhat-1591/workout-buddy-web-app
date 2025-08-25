import { STORAGE_KEYS } from '../constants/config';
import { DailyProgress, UserStats, UserProfile, WorkoutSession } from '../types';

class StorageUtils {
  // Daily Progress
  getDailyProgress(): DailyProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting daily progress:', error);
      return {};
    }
  }

  saveDailyProgress(progress: DailyProgress): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving daily progress:', error);
    }
  }

  // User Stats
  getUserStats(): UserStats | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  saveUserStats(stats: UserStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  }

  // User Profile
  getUserProfile(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  // Workout History
  getWorkoutHistory(): WorkoutSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting workout history:', error);
      return [];
    }
  }

  saveWorkoutSession(session: WorkoutSession): void {
    try {
      const history = this.getWorkoutHistory();
      history.push(session);
      
      // Keep only last 100 sessions to prevent storage bloat
      const recentHistory = history.slice(-100);
      
      localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(recentHistory));
    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  }

  // Clear all data
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  // Export data for backup
  exportData(): string {
    try {
      const data = {
        dailyProgress: this.getDailyProgress(),
        userStats: this.getUserStats(),
        userProfile: this.getUserProfile(),
        workoutHistory: this.getWorkoutHistory(),
        exportDate: new Date().toISOString(),
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '';
    }
  }

  // Import data from backup
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.dailyProgress) {
        this.saveDailyProgress(data.dailyProgress);
      }
      
      if (data.userStats) {
        this.saveUserStats(data.userStats);
      }
      
      if (data.userProfile) {
        this.saveUserProfile(data.userProfile);
      }
      
      if (data.workoutHistory && Array.isArray(data.workoutHistory)) {
        localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(data.workoutHistory));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number } {
    try {
      let used = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          used += item.length;
        }
      });

      // Estimate available storage (localStorage typically has 5-10MB limit)
      const available = 5 * 1024 * 1024 - used; // Assume 5MB limit

      return { used, available };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, available: 0 };
    }
  }

  // Check if storage is available
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

const storageUtils = new StorageUtils();
export default storageUtils;