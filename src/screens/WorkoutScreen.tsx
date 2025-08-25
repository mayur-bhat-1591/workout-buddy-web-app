import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Dumbbell, 
  Clock, 
  Target, 
  Zap,
  ChevronRight,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { useWorkout } from '../contexts/WorkoutContext';
import { useProgress } from '../contexts/ProgressContext';
import GroqService from '../services/GroqService';
import { EquipmentAnalysis, WorkoutPlan, UserProfile } from '../types';

interface WorkoutScreenProps {
  onNavigate: (screen: string) => void;
  onWorkoutPlanReady: (plan: WorkoutPlan) => void;
}

const WorkoutScreen: React.FC<WorkoutScreenProps> = ({ 
  onNavigate, 
  onWorkoutPlanReady 
}) => {
  const { equipmentAnalysis, setEquipmentAnalysis } = useWorkout();
  const { userStats } = useProgress();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default user profile for workout generation
  const defaultUserProfile: UserProfile = {
    name: 'User',
    fitnessLevel: 'intermediate',
    goals: ['strength', 'endurance', 'weight_loss'],
    preferences: {
      workoutDuration: 45,
      voiceStyle: 'motivating',
      difficulty: 'intermediate',
    },
  };

  // Quick equipment setup for instant workout
  const createQuickEquipment = (): EquipmentAnalysis => ({
    equipment: [
      { name: 'Dumbbells', type: 'strength', condition: 'good', quantity: 2, weight_range: '10-30 lbs' },
      { name: 'Yoga Mat', type: 'flexibility', condition: 'good', quantity: 1 },
      { name: 'Resistance Bands', type: 'strength', condition: 'good', quantity: 3 }
    ],
    space_assessment: 'Home gym setup optimized for full-body workouts',
    recommended_workout_types: ['Strength Training', 'HIIT', 'Full Body', 'Flexibility'],
    safety_considerations: ['Ensure proper form', 'Adequate space for movements'],
    missing_equipment_suggestions: ['Pull-up bar', 'Kettlebell'],
  });

  const generateWorkoutPlan = async (equipment: EquipmentAnalysis) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🏋️ Generating workout plan with equipment:', equipment);
      const workoutResponse = await GroqService.generateWorkoutPlan(
        equipment.equipment,
        defaultUserProfile
      );

      if (workoutResponse.success) {
        console.log('✅ Workout plan generated:', workoutResponse.data);
        onWorkoutPlanReady(workoutResponse.data);
        onNavigate('session');
      } else {
        setError('Failed to generate workout plan. Please try again.');
        console.error('❌ Workout generation failed:', workoutResponse.error);
      }
    } catch (err) {
      setError('Error generating workout plan. Please try again.');
      console.error('💥 Workout generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickStart = () => {
    const quickEquipment = createQuickEquipment();
    setEquipmentAnalysis(quickEquipment);
    generateWorkoutPlan(quickEquipment);
  };

  const handleUseExistingEquipment = () => {
    if (equipmentAnalysis) {
      generateWorkoutPlan(equipmentAnalysis);
    }
  };

  const handleSetupEquipment = () => {
    onNavigate('detection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20"
            animate={{
              x: [0, Math.random() * 100, 0],
              y: [0, Math.random() * 100, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 space-y-6 pb-24">
        {/* Mobile Navigation Header */}
        <motion.div 
          className="flex items-center justify-between py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} />
            <span className="text-sm font-medium">Back</span>
          </motion.button>
          
          <h2 className="text-lg font-semibold text-white">Start Workout</h2>
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </motion.div>

        {/* Header */}
        <motion.div 
          className="text-center py-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-6"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <Dumbbell className="text-white" size={28} />
            </div>
          </motion.div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Ready to Workout?
          </h1>
          <p className="text-xl text-gray-300">
            Let's get your AI-powered audio workout started
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-blue-500/30 rounded-xl p-4 text-center">
            <Clock className="text-blue-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{userStats.currentStreak}</p>
            <p className="text-blue-300 text-sm">Day Streak</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-green-500/30 rounded-xl p-4 text-center">
            <Target className="text-green-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{userStats.weeklyStats.daysCompleted}/5</p>
            <p className="text-green-300 text-sm">This Week</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-lg border border-pink-500/30 rounded-xl p-4 text-center">
            <Dumbbell className="text-pink-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{userStats.totalWorkouts}</p>
            <p className="text-pink-300 text-sm">Total</p>
          </div>
        </motion.div>

        {/* Workout Options */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Quick Start - Primary Option */}
          <motion.div 
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 cursor-pointer group hover:border-purple-400/50 transition-all duration-300"
            onClick={isGenerating ? undefined : handleQuickStart}
            whileHover={isGenerating ? {} : { scale: 1.02, y: -5 }}
            whileTap={isGenerating ? {} : { scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <motion.div 
                  className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="text-white" size={32} />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Quick Start Workout
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Jump right in with AI-optimized equipment setup
                  </p>
                  <p className="text-purple-300 text-sm mt-2">
                    ⚡ Instant audio coaching • 45min session • Full body
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronRight className="text-purple-400" size={32} />
              </motion.div>
            </div>
          </motion.div>

          {/* Existing Equipment Option */}
          {equipmentAnalysis && (
            <motion.div 
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6 cursor-pointer group hover:border-blue-400/50 transition-all duration-300"
              onClick={isGenerating ? undefined : handleUseExistingEquipment}
              whileHover={isGenerating ? {} : { scale: 1.02, y: -3 }}
              whileTap={isGenerating ? {} : { scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <Settings className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Use My Equipment
                    </h3>
                    <p className="text-gray-300">
                      {equipmentAnalysis.equipment.length} items detected
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-blue-400" size={24} />
              </div>
            </motion.div>
          )}

          {/* Setup Equipment Option */}
          <motion.div 
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg border border-green-500/30 rounded-2xl p-6 cursor-pointer group hover:border-green-400/50 transition-all duration-300"
            onClick={isGenerating ? undefined : handleSetupEquipment}
            whileHover={isGenerating ? {} : { scale: 1.02, y: -3 }}
            whileTap={isGenerating ? {} : { scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <Dumbbell className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {equipmentAnalysis ? 'Update Equipment' : 'Setup Equipment'}
                  </h3>
                  <p className="text-gray-300">
                    Scan or manually select your home gym equipment
                  </p>
                </div>
              </div>
              <ChevronRight className="text-green-400" size={24} />
            </div>
          </motion.div>
        </motion.div>

        {/* Loading State */}
        {isGenerating && (
          <motion.div 
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-white mb-2">
              Generating Your Workout
            </h3>
            <p className="text-gray-300">
              AI is creating a personalized workout plan just for you...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-lg border border-red-500/30 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-xl font-bold text-red-300 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkoutScreen;
