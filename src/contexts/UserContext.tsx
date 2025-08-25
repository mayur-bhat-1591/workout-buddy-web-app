import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { UserProfile } from '../types';

interface UserState {
  isFirstTime: boolean;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  hasCompletedOnboarding: boolean;
  preferences: {
    showSplashScreen: boolean;
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
  };
}

type UserAction =
  | { type: 'SET_FIRST_TIME'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserState['preferences']> }
  | { type: 'INITIALIZE_USER'; payload: UserState };

const initialState: UserState = {
  isFirstTime: true,
  isAuthenticated: false,
  profile: null,
  hasCompletedOnboarding: false,
  preferences: {
    showSplashScreen: true,
    theme: 'auto',
    notifications: true,
  },
};

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_FIRST_TIME':
      return { ...state, isFirstTime: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, isAuthenticated: true };
    
    case 'COMPLETE_ONBOARDING':
      return { 
        ...state, 
        hasCompletedOnboarding: true,
        isFirstTime: false,
        preferences: { ...state.preferences, showSplashScreen: false }
      };
    
    case 'UPDATE_PREFERENCES':
      return { 
        ...state, 
        preferences: { ...state.preferences, ...action.payload }
      };
    
    case 'INITIALIZE_USER':
      return action.payload;
    
    default:
      return state;
  }
};

interface UserContextType extends UserState {
  setFirstTime: (isFirstTime: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  updatePreferences: (preferences: Partial<UserState['preferences']>) => void;
  createUserProfile: (profileData: Partial<UserProfile>) => void;
  shouldShowSplash: () => boolean;
}

const UserContext = createContext<UserContextType | null>(null);

const USER_STORAGE_KEY = 'workoutbuddy_user_data';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUserData = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        dispatch({ type: 'INITIALIZE_USER', payload: userData });
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    }
  }, []);

  // Save user data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setFirstTime = useCallback((isFirstTime: boolean) => {
    dispatch({ type: 'SET_FIRST_TIME', payload: isFirstTime });
  }, []);

  const setAuthenticated = useCallback((isAuthenticated: boolean) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: isAuthenticated });
  }, []);

  const setProfile = useCallback((profile: UserProfile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
  }, []);

  const completeOnboarding = useCallback(() => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  }, []);

  const updatePreferences = useCallback((preferences: Partial<UserState['preferences']>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  const createUserProfile = useCallback((profileData: Partial<UserProfile>) => {
    const defaultProfile: UserProfile = {
      name: profileData.name || 'Fitness Enthusiast',
      fitnessLevel: profileData.fitnessLevel || 'intermediate',
      goals: profileData.goals || ['strength', 'endurance'],
      preferences: {
        workoutDuration: profileData.preferences?.workoutDuration || 45,
        voiceStyle: profileData.preferences?.voiceStyle || 'motivating',
        difficulty: profileData.preferences?.difficulty || 'intermediate',
      },
    };
    
    setProfile(defaultProfile);
  }, [setProfile]);

  const shouldShowSplash = useCallback(() => {
    return state.isFirstTime && state.preferences.showSplashScreen;
  }, [state.isFirstTime, state.preferences.showSplashScreen]);

  const value: UserContextType = {
    ...state,
    setFirstTime,
    setAuthenticated,
    setProfile,
    completeOnboarding,
    updatePreferences,
    createUserProfile,
    shouldShowSplash,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
