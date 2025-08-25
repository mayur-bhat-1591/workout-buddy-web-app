import { DailyProgress, UserStats, WeeklyStats } from '../types';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

export class DemoDataGenerator {
  private static readonly DEMO_KEY = 'workoutbuddy_demo_mode';
  
  static isDemoMode(): boolean {
    return localStorage.getItem(this.DEMO_KEY) === 'true';
  }
  
  static enableDemoMode(): void {
    localStorage.setItem(this.DEMO_KEY, 'true');
    this.generateDemoData();
  }
  
  static disableDemoMode(): void {
    localStorage.removeItem(this.DEMO_KEY);
    // Clear demo data
    localStorage.removeItem('workoutbuddy_daily_progress');
    localStorage.removeItem('workoutbuddy_user_stats');
  }
  
  private static generateDemoData(): void {
    const demoProgress = this.generateDemoProgress();
    const demoStats = this.generateDemoStats(demoProgress);
    
    localStorage.setItem('workoutbuddy_daily_progress', JSON.stringify(demoProgress));
    localStorage.setItem('workoutbuddy_user_stats', JSON.stringify(demoStats));
  }
  
  private static generateDemoProgress(): DailyProgress {
    const progress: DailyProgress = {};
    const today = new Date();
    
    // Generate 30 days of demo data
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const shouldComplete = Math.random() > 0.25; // 75% completion rate
      
      if (shouldComplete) {
        const audioMinutes = 30 + Math.random() * 25; // 30-55 minutes
        const completionPercentage = Math.min(100, (audioMinutes / 36) * 100);
        
        progress[date] = {
          completed: completionPercentage >= 80,
          audioMinutes: Math.round(audioMinutes),
          completionPercentage: Math.round(completionPercentage),
          timestamp: subDays(today, i).getTime(),
        };
      }
    }
    
    return progress;
  }
  
  private static generateDemoStats(progress: DailyProgress): UserStats {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    
    // Calculate current week stats
    const currentWeekDates: string[] = [];
    let weeklyCompleted = 0;
    
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(weekStart, i), 'yyyy-MM-dd');
      currentWeekDates.push(date);
      
      if (progress[date]?.completed) {
        weeklyCompleted++;
      }
    }
    
    // Calculate streak
    let currentStreak = 0;
    const sortedDates = Object.keys(progress).sort().reverse();
    
    for (const date of sortedDates) {
      if (progress[date]?.completed) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate totals
    const totalWorkouts = Object.values(progress).filter(p => p.completed).length;
    const totalMinutes = Object.values(progress).reduce((sum, p) => sum + (p.audioMinutes || 0), 0);
    
    const weeklyStats: WeeklyStats = {
      daysCompleted: weeklyCompleted,
      weeklyGoal: 5,
      daysRemaining: Math.max(0, 5 - weeklyCompleted),
      weeklyPercentage: Math.round((weeklyCompleted / 5) * 100),
      currentWeekDates,
    };
    
    return {
      currentStreak,
      weeklyStats,
      lastUpdated: Date.now(),
      totalWorkouts,
      totalMinutes: Math.round(totalMinutes),
    };
  }
  
  static getDemoAchievements() {
    return [
      {
        id: 'first_workout',
        title: 'First Steps',
        description: 'Completed your first workout',
        icon: '🎯',
        unlocked: true,
        unlockedAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Completed 5 workouts in a week',
        icon: '🏆',
        unlocked: true,
        unlockedAt: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Maintained a 7-day streak',
        icon: '🔥',
        unlocked: true,
        unlockedAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 'equipment_expert',
        title: 'Equipment Expert',
        description: 'Used 5 different equipment types',
        icon: '💪',
        unlocked: false,
      },
      {
        id: 'marathon_month',
        title: 'Marathon Month',
        description: 'Complete 20 workouts in a month',
        icon: '🏃‍♂️',
        unlocked: false,
      },
    ];
  }
  
  static getDemoInsights() {
    return {
      weeklyTrend: '+15%',
      favoriteEquipment: 'Dumbbells',
      averageWorkoutTime: '42 minutes',
      bestStreak: '12 days',
      totalCaloriesBurned: 2840,
      improvementAreas: ['Consistency on weekends', 'Try cardio equipment'],
      motivationalMessage: "You're crushing your fitness goals! Keep up the amazing work! 💪",
    };
  }
}

// Hook for easy demo mode management
export const useDemoMode = () => {
  const isDemoMode = DemoDataGenerator.isDemoMode();
  
  return {
    isDemoMode,
    enableDemo: DemoDataGenerator.enableDemoMode,
    disableDemo: DemoDataGenerator.disableDemoMode,
    getDemoAchievements: DemoDataGenerator.getDemoAchievements,
    getDemoInsights: DemoDataGenerator.getDemoInsights,
  };
};
