import React, { useState, useCallback, useMemo } from 'react';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { ProgressProvider } from './contexts/ProgressContext';
import Navigation from './components/Navigation';
import SplashScreen from './components/SplashScreen';
import DemoModeToggle from './components/DemoModeToggle';
import HomeScreen from './screens/HomeScreen';
import EquipmentDetectionScreen from './screens/EquipmentDetectionScreen';
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
    if (screen === 'workout' && !workoutFlowState.equipmentAnalysis) {
      // Redirect to equipment detection if no equipment has been analyzed
      setCurrentScreen('detection');
      return;
    }
    setCurrentScreen(screen as Screen);
  }, [workoutFlowState.equipmentAnalysis]);

  const handleEquipmentAnalyzed = useCallback(async (analysis: EquipmentAnalysis) => {
    console.log('🎯 Equipment analyzed:', analysis);
    setWorkoutFlowState(prev => ({ ...prev, equipmentAnalysis: analysis }));
    
    // Auto-generate workout plan
    console.log('🏋️ Starting workout plan generation...');
    setIsGeneratingWorkout(true);
    try {
      console.log('📋 Calling GroqService with:', { equipment: analysis.equipment, userProfile: defaultUserProfile });
      const workoutResponse = await GroqService.generateWorkoutPlan(
        analysis.equipment,
        defaultUserProfile
      );

      console.log('📊 Groq response:', workoutResponse);

      if (workoutResponse.success) {
        console.log('✅ Workout plan generated successfully:', workoutResponse.data);
        setWorkoutFlowState(prev => ({ 
          ...prev, 
          workoutPlan: workoutResponse.data 
        }));
        setCurrentScreen('session'); // Automatically move to workout session
      } else {
        console.error('❌ Failed to generate workout plan:', workoutResponse.error);
        alert(`Failed to generate workout plan: ${workoutResponse.error}`);
      }
    } catch (error) {
      console.error('💥 Error generating workout plan:', error);
      alert(`Error generating workout plan: ${error}`);
    } finally {
      setIsGeneratingWorkout(false);
      console.log('🏁 Workout generation process completed');
    }
  }, [defaultUserProfile]);

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

    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      
      case 'detection':
        return (
          <EquipmentDetectionScreen 
            onEquipmentAnalyzed={handleEquipmentAnalyzed}
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
          />
        );
      
      case 'progress':
        return <PersonalTrackerScreen />;
      
      case 'complete':
        if (!workoutFlowState.sessionResult) {
          setCurrentScreen('home');
          return null;
        }
        return (
          <WorkoutCompleteScreen
            sessionResult={workoutFlowState.sessionResult}
            completionMessage={workoutFlowState.completionMessage}
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