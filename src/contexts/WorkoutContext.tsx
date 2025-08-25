import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { WorkoutContextType, WorkoutSession, WorkoutPlan, Equipment, EquipmentAnalysis } from '../types';
import AudioTracker from '../services/AudioTracker';

interface WorkoutState {
  currentWorkout: WorkoutSession | null;
  isSessionActive: boolean;
  audioProgress: number;
  equipmentAnalysis: EquipmentAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

type WorkoutAction =
  | { type: 'START_WORKOUT'; payload: { workoutPlan: WorkoutPlan; equipment: Equipment[] } }
  | { type: 'PAUSE_WORKOUT' }
  | { type: 'RESUME_WORKOUT' }
  | { type: 'END_WORKOUT' }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'SET_EQUIPMENT_ANALYSIS'; payload: EquipmentAnalysis }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const initialState: WorkoutState = {
  currentWorkout: null,
  isSessionActive: false,
  audioProgress: 0,
  equipmentAnalysis: null,
  isLoading: false,
  error: null,
};

// Simple ID generator to replace uuid
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

const workoutReducer = (state: WorkoutState, action: WorkoutAction): WorkoutState => {
  switch (action.type) {
    case 'START_WORKOUT':
      const newSession: WorkoutSession = {
        id: generateId(),
        startTime: Date.now(),
        audioPlaybackTime: 0,
        targetTime: action.payload.workoutPlan.totalDuration * 60 * 1000,
        completed: false,
        completionPercentage: 0,
        workoutPlan: action.payload.workoutPlan,
        equipmentUsed: action.payload.equipment,
      };
      
      return {
        ...state,
        currentWorkout: newSession,
        isSessionActive: true,
        audioProgress: 0,
        error: null,
      };

    case 'PAUSE_WORKOUT':
      return {
        ...state,
        isSessionActive: false,
      };

    case 'RESUME_WORKOUT':
      return {
        ...state,
        isSessionActive: true,
      };

    case 'END_WORKOUT':
      const endedSession = state.currentWorkout ? {
        ...state.currentWorkout,
        endTime: Date.now(),
        completed: state.audioProgress >= 80, // 80% completion threshold
        completionPercentage: state.audioProgress,
      } : null;

      return {
        ...state,
        currentWorkout: endedSession,
        isSessionActive: false,
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        audioProgress: action.payload,
        currentWorkout: state.currentWorkout ? {
          ...state.currentWorkout,
          completionPercentage: action.payload,
        } : null,
      };

    case 'SET_EQUIPMENT_ANALYSIS':
      return {
        ...state,
        equipmentAnalysis: action.payload,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  const startWorkout = useCallback((workoutPlan: WorkoutPlan, equipment: Equipment[]) => {
    dispatch({ type: 'START_WORKOUT', payload: { workoutPlan, equipment } });
    
    // Initialize audio tracking
    AudioTracker.startSession();
    AudioTracker.setProgressCallback((progress) => {
      dispatch({ type: 'UPDATE_PROGRESS', payload: progress.completionPercentage });
    });
    AudioTracker.startPlaybackTracking();
  }, []);

  const pauseWorkout = useCallback(() => {
    dispatch({ type: 'PAUSE_WORKOUT' });
    AudioTracker.onAudioPause();
  }, []);

  const resumeWorkout = useCallback(() => {
    dispatch({ type: 'RESUME_WORKOUT' });
    AudioTracker.onAudioPlay();
  }, []);

  const endWorkout = useCallback(() => {
    dispatch({ type: 'END_WORKOUT' });
    AudioTracker.onAudioEnd();
    AudioTracker.stopTracking();
  }, []);

  const updateProgress = useCallback((progress: number) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
  }, []);

  const setEquipmentAnalysis = useCallback((analysis: EquipmentAnalysis) => {
    dispatch({ type: 'SET_EQUIPMENT_ANALYSIS', payload: analysis });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: WorkoutContextType & {
    isLoading: boolean;
    error: string | null;
    setEquipmentAnalysis: (analysis: EquipmentAnalysis) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
  } = {
    currentWorkout: state.currentWorkout,
    isSessionActive: state.isSessionActive,
    audioProgress: state.audioProgress,
    equipmentAnalysis: state.equipmentAnalysis,
    isLoading: state.isLoading,
    error: state.error,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    endWorkout,
    updateProgress,
    setEquipmentAnalysis,
    setLoading,
    setError,
    clearError,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};