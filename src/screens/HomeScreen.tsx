import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Play, 
  BarChart3, 
  Zap, 
  Target, 
  Calendar,
  Award,
  TrendingUp,
  Clock,
  Flame,
  Star,
  ChevronRight,
  Dumbbell,
  Trophy,
  Settings
} from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';
import { useUser } from '../contexts/UserContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { format } from 'date-fns';

const getStreakText = (streak: number) => {
  if (streak === 0) return "Start your journey!";
  if (streak === 1) return "Great start! 🎯";
  if (streak < 7) return `${streak} day streak! 🔥`;
  if (streak < 14) return `${streak} day streak! Amazing! 🚀`;
  return `${streak} day streak! Unstoppable! 💪`;
};

const getWeeklyProgressText = (completed: number, goal: number) => {
  if (completed === 0) return "Ready to start this week strong!";
  if (completed >= goal) return "Weekly goal achieved! 🎉";
  const remaining = goal - completed;
  return `${completed}/${goal} workouts completed, ${remaining} to go!`;
};

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { userStats, isLoading } = useProgress();
  const { equipmentAnalysis } = useWorkout();

  const quickStats = {
    currentStreak: userStats.currentStreak,
    weeklyCompleted: userStats.weeklyStats.daysCompleted,
    weeklyGoal: userStats.weeklyStats.weeklyGoal,
    totalWorkouts: userStats.totalWorkouts,
  };

  const hasEquipment = equipmentAnalysis && equipmentAnalysis.equipment.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            animate={{
              x: [0, Math.random() * 100, 0],
              y: [0, Math.random() * 100, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
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

      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8 pb-24">
        {/* Simple Header */}
        <motion.div 
          className="text-center py-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
              <Dumbbell className="text-white" size={28} />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Ready to move?
          </h1>
          <motion.div
            className="text-xl text-blue-300 font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getStreakText(quickStats.currentStreak)}
          </motion.div>
        </motion.div>

      {/* Quick Stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full w-fit mx-auto mb-2">
              <Trophy className="text-orange-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quickStats.currentStreak}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Day Streak
            </p>
          </div>

          <div className="card text-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-full w-fit mx-auto mb-2">
              <Target className="text-primary-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quickStats.weeklyCompleted}/{quickStats.weeklyGoal}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This Week
            </p>
          </div>

          <div className="card text-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto mb-2">
              <Dumbbell className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quickStats.totalWorkouts}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Workouts
            </p>
          </div>

          <div className="card text-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full w-fit mx-auto mb-2">
              <Clock className="text-green-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(userStats.totalMinutes / 60)}h
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Time
            </p>
          </div>
        </div>
      )}

      {/* Main Action - Start Workout */}
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.button
          onClick={() => onNavigate('workout')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 px-12 rounded-2xl text-2xl shadow-2xl transition-all duration-300"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: [
              "0 20px 40px rgba(147, 51, 234, 0.3)",
              "0 25px 50px rgba(147, 51, 234, 0.4)",
              "0 20px 40px rgba(147, 51, 234, 0.3)"
            ]
          }}
          transition={{ 
            boxShadow: { duration: 2, repeat: Infinity },
            scale: { duration: 0.2 },
            y: { duration: 0.2 }
          }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Play size={32} />
            </motion.div>
            Start Workout
          </div>
        </motion.button>
      </motion.div>

        {/* Simple Progress Overview */}
        {!isLoading && (
          <motion.div 
            className="bg-gradient-to-br from-slate-800/50 to-purple-800/30 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-white mb-1">{quickStats.currentStreak}</p>
                <p className="text-gray-300 text-sm">Day Streak</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">{quickStats.weeklyCompleted}/5</p>
                <p className="text-gray-300 text-sm">This Week</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">{Math.round(userStats.totalMinutes / 60)}h</p>
                <p className="text-gray-300 text-sm">Total Time</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Secondary Actions */}
        <motion.div 
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <motion.button
            onClick={() => onNavigate('progress')}
            className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 backdrop-blur-lg border border-slate-500/30 rounded-xl p-4 text-white hover:border-slate-400/50 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <BarChart3 size={24} className="text-blue-400" />
              <span className="font-medium">View Progress</span>
            </div>
          </motion.button>

          <motion.button
            onClick={() => onNavigate('detection')}
            className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 backdrop-blur-lg border border-slate-500/30 rounded-xl p-4 text-white hover:border-slate-400/50 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Settings size={24} className="text-green-400" />
              <span className="font-medium">Setup Equipment</span>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;