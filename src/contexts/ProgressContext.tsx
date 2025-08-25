import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { ProgressContextType, DailyProgress, UserStats, WeeklyStats } from '../types';
import AudioTracker from '../services/AudioTracker';
import StorageUtils from '../utils/storageUtils';

interface ProgressState {
  dailyProgress: DailyProgress;
  userStats: UserStats;
  isLoading: boolean;
}

type ProgressAction =
  | { type: 'LOAD_PROGRESS'; payload: { dailyProgress: DailyProgress; userStats: UserStats } }
  | { type: 'UPDATE_DAILY_PROGRESS'; payload: { date: string; progress: any } }
  | { type: 'UPDATE_STATS'; payload: UserStats }
  | { type: 'SET_LOADING'; payload: boolean };

const defaultStats: UserStats = {
  currentStreak: 0,
  weeklyStats: {
    daysCompleted: 0,
    weeklyGoal: 5,
    daysRemaining: 5,
    weeklyPercentage: 0,
    currentWeekDates: [],
  },
  totalWorkouts: 0,
  totalMinutes: 0,
  lastUpdated: Date.now(),
};

const initialState: ProgressState = {
  dailyProgress: {},
  userStats: defaultStats,
  isLoading: true,
};

const progressReducer = (state: ProgressState, action: ProgressAction): ProgressState => {
  switch (action.type) {
    case 'LOAD_PROGRESS':
      return {
        ...state,
        dailyProgress: action.payload.dailyProgress,
        userStats: action.payload.userStats,
        isLoading: false,
      };

    case 'UPDATE_DAILY_PROGRESS':
      const updatedProgress = {
        ...state.dailyProgress,
        [action.payload.date]: action.payload.progress,
      };

      return {
        ...state,
        dailyProgress: updatedProgress,
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        userStats: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

const ProgressContext = createContext<ProgressContextType | null>(null);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  // Load progress data on mount
  useEffect(() => {
    const loadProgress = () => {
      try {
        const dailyProgress = StorageUtils.getDailyProgress();
        const userStats = StorageUtils.getUserStats() || defaultStats;
        
        dispatch({
          type: 'LOAD_PROGRESS',
          payload: { dailyProgress, userStats },
        });
      } catch (error) {
        console.error('Error loading progress data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadProgress();
  }, []);

  const updateDailyProgress = useCallback(async (date: string, progress: any) => {
    try {
      dispatch({
        type: 'UPDATE_DAILY_PROGRESS',
        payload: { date, progress },
      });

      // Save to storage
      const updatedProgress = { ...state.dailyProgress, [date]: progress };
      StorageUtils.saveDailyProgress(updatedProgress);

      // Recalculate stats
      const newStats = await AudioTracker.updateStreakAndStats(updatedProgress);
      dispatch({ type: 'UPDATE_STATS', payload: newStats });
      StorageUtils.saveUserStats(newStats);
    } catch (error) {
      console.error('Error updating daily progress:', error);
    }
  }, [state.dailyProgress]);

  const calculateStreak = useCallback((): number => {
    return AudioTracker.calculateCurrentStreak(state.dailyProgress);
  }, [state.dailyProgress]);

  const getWeeklyStats = useCallback((): WeeklyStats => {
    return AudioTracker.calculateWeeklyStats(state.dailyProgress);
  }, [state.dailyProgress]);

  const refreshStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const currentStreak = calculateStreak();
      const weeklyStats = getWeeklyStats();
      const totalWorkouts = Object.values(state.dailyProgress).filter(day => day.completed).length;
      const totalMinutes = Object.values(state.dailyProgress).reduce((sum, day) => sum + day.audioMinutes, 0);

      const updatedStats: UserStats = {
        currentStreak,
        weeklyStats,
        totalWorkouts,
        totalMinutes,
        lastUpdated: Date.now(),
      };

      dispatch({ type: 'UPDATE_STATS', payload: updatedStats });
      StorageUtils.saveUserStats(updatedStats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.dailyProgress, calculateStreak, getWeeklyStats]);

  // Auto-refresh stats when daily progress changes
  useEffect(() => {
    if (Object.keys(state.dailyProgress).length > 0) {
      refreshStats();
    }
  }, [state.dailyProgress, refreshStats]);

  const value: ProgressContextType & {
    isLoading: boolean;
    refreshStats: () => Promise<void>;
  } = {
    dailyProgress: state.dailyProgress,
    userStats: state.userStats,
    isLoading: state.isLoading,
    updateDailyProgress,
    calculateStreak,
    getWeeklyStats,
    refreshStats,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};