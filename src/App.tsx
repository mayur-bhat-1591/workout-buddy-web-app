import React, { useState, useCallback, useMemo } from 'react';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { ProgressProvider } from './contexts/ProgressContext';
import Navigation from './components/Navigation';
import SplashScreen from './components/SplashScreen';
import DemoModeToggle from './components/DemoModeToggle';
import HomeScreen from './screens/HomeScreen';
import EquipmentDetectionScreen from './screens/EquipmentDetectionScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import WorkoutSessionScreen from './screens/WorkoutSessionScreen';
import PersonalTrackerScreen from './screens/PersonalTrackerScreen';
import WorkoutCompleteScreen from './components/WorkoutCompleteScreen';
import LoadingSpinner from './components/LoadingSpinner';
import GroqService from './services/GroqService';
import { EquipmentAnalysis, WorkoutPlan, UserProfile } from './types';
import { Toaster } from 'react-hot-toast';

type Screen = 'home' | 'detection' | 'workout' | 'progress' | 'complete' | 'session';

interface WorkoutFlowState {
  equipmentAnalysis: EquipmentAnalysis | null;
  workoutPlan: WorkoutPlan | null;
  sessionResult: any | null;
  completionMessage: string;
}

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [workoutFlowState, setWorkoutFlowState] = useState<WorkoutFlowState>({
    equipmentAnalysis: null,
    workoutPlan: null,
    sessionResult: null,
    completionMessage: '',
  });

  // Memoize user profile to prevent unnecessary re-renders
  const defaultUserProfile: UserProfile = useMemo(() => ({
    name: 'Fitness Enthusiast',
    fitnessLevel: 'intermediate',
    goals: ['strength', 'endurance', 'weight_loss'],
    preferences: {
      workoutDuration: 45,
      voiceStyle: 'motivating',
      difficulty: 'intermediate',
    },
  }), []);

  const handleNavigate = useCallback((screen: string) => {
    // For audio-first platform, allow direct workout access
    // Equipment will be checked within the workout flow
    console.log('🧭 Navigating to screen:', screen);
    setCurrentScreen(screen as Screen);
  }, []);

  const handleEquipmentAnalyzed = useCallback(async (analysis: EquipmentAnalysis) => {
    console.log('🎯 Equipment analyzed:', analysis);
    setWorkoutFlowState(prev => ({ ...prev, equipmentAnalysis: analysis }));
    
    // For equipment detection screen, just store the analysis
    // Workout generation will be handled by WorkoutScreen
  }, []);

  const handleWorkoutPlanReady = useCallback((plan: WorkoutPlan) => {
    console.log('📋 Workout plan ready:', plan);
    setWorkoutFlowState(prev => ({ ...prev, workoutPlan: plan }));
  }, []);

  const handleWorkoutComplete = useCallback((result: any) => {
    setWorkoutFlowState(prev => ({
      ...prev,
      sessionResult: result,
      completionMessage: result.completionMessage || 'Great workout!',
    }));
    setCurrentScreen('complete');
  }, []);

  const handleContinueFromComplete = useCallback(() => {
    setCurrentScreen('progress');
  }, []);

  const renderCurrentScreen = () => {
    if (isGeneratingWorkout) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner 
            size="large" 
            text="Generating your personalized workout plan..." 
          />
        </div>
      );
    }

    console.log('🖥️ Rendering screen:', currentScreen);
    
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      
      case 'detection':
        return (
          <EquipmentDetectionScreen 
            onEquipmentAnalyzed={handleEquipmentAnalyzed}
            onNavigate={handleNavigate}
          />
        );
      
      case 'session':
        if (!workoutFlowState.workoutPlan) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  No workout plan available
                </p>
                <button
                  onClick={() => setCurrentScreen('detection')}
                  className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Analyze Equipment First
                </button>
              </div>
            </div>
          );
        }
        return (
          <WorkoutSessionScreen
            workoutPlan={workoutFlowState.workoutPlan}
            onWorkoutComplete={handleWorkoutComplete}
            onNavigate={handleNavigate}
          />
        );
      
      case 'workout':
        return (
          <WorkoutScreen 
            onNavigate={handleNavigate}
            onWorkoutPlanReady={handleWorkoutPlanReady}
          />
        );
      
      case 'progress':
        return <PersonalTrackerScreen onNavigate={handleNavigate} />;
      
      case 'complete':
        return (
          <WorkoutCompleteScreen
            sessionResult={workoutFlowState.sessionResult || {
              completed: true,
              audioPlaybackMinutes: 45,
              targetMinutes: 45,
              completionPercentage: 100,
              date: new Date().toISOString().split('T')[0]
            }}
            completionMessage={workoutFlowState.completionMessage || 'Great workout!'}
            onContinue={handleContinueFromComplete}
          />
        );
      
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <WorkoutProvider>
        <ProgressProvider>
          <main className="min-h-screen">
            {renderCurrentScreen()}
          </main>
          
          {/* Navigation - hidden during workout session and completion screen */}
          {!['session', 'complete'].includes(currentScreen) && (
            <Navigation 
              currentScreen={currentScreen} 
              onNavigate={handleNavigate} 
            />
          )}

          {/* Demo Mode Toggle */}
          <DemoModeToggle />

          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ProgressProvider>
      </WorkoutProvider>
    </div>
  );
};

export default App;