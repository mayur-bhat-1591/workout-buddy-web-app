import React, { useState, useEffect, useMemo, useCallback } from 'react';
import HomeScreen from './screens/HomeScreen';
import EquipmentDetectionScreen from './screens/EquipmentDetectionScreen';
import WorkoutSessionScreen from './screens/WorkoutSessionScreen';
import PersonalTrackerScreen from './screens/PersonalTrackerScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import SplashScreen from './components/SplashScreen';
import WorkoutCompleteScreen from './components/WorkoutCompleteScreen';
import ProgramsScreen from './screens/ProgramsScreen';
import { AuthModal } from './components/auth/AuthModal';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EquipmentAnalysis, WorkoutPlan, UserProfile } from './types';
import { DatabaseService } from './services/DatabaseService';

type Screen = 'home' | 'detection' | 'workout' | 'progress' | 'complete' | 'session' | 'programs';

interface WorkoutFlowState {
  equipmentAnalysis: EquipmentAnalysis | null;
  workoutPlan: WorkoutPlan | null;
  sessionResult: any | null;
  completionMessage: string;
}

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [workoutFlowState, setWorkoutFlowState] = useState<WorkoutFlowState>({
    equipmentAnalysis: null,
    workoutPlan: null,
    sessionResult: null,
    completionMessage: ''
  });

  // Migrate localStorage data when user signs in
  useEffect(() => {
    if (user && !loading) {
      DatabaseService.migrateLocalStorageData(user.id);
    }
  }, [user, loading]);

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
      
      case 'programs':
        return <ProgramsScreen onNavigate={handleNavigate} />;
      
      case 'complete':
        return (
          <WorkoutCompleteScreen 
            sessionResult={workoutFlowState.sessionResult}
            completionMessage={workoutFlowState.completionMessage}
            onNavigate={handleNavigate}
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
          
          {/* Authentication Modal */}
          <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </ProgressProvider>
      </WorkoutProvider>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;