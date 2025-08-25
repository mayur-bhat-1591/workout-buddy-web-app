import React from 'react';
import { Play, Camera, BarChart3, Target, Dumbbell, Clock, Trophy } from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { getStreakText, getWeeklyProgressText } from '../utils/dateUtils';

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
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Welcome to WorkoutBuddy
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your AI-powered fitness companion
        </p>
      </div>

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

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Equipment Detection */}
          <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('detection')}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Camera className="text-blue-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  {hasEquipment ? 'Update Equipment' : 'Detect Equipment'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {hasEquipment 
                    ? 'Modify your equipment setup for better workouts'
                    : 'Record your home gym to get personalized workouts'
                  }
                </p>
                <div className="flex items-center text-blue-500 text-sm font-medium">
                  <span>
                    {hasEquipment ? 'Update Setup' : 'Get Started'}
                  </span>
                  <Play className="ml-1" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Start Workout */}
          <div 
            className={`card transition-shadow cursor-pointer ${hasEquipment ? 'hover:shadow-lg' : 'opacity-75 cursor-not-allowed'}`}
            onClick={() => hasEquipment && onNavigate('workout')}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${hasEquipment ? 'bg-primary-100 dark:bg-primary-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Dumbbell className={hasEquipment ? 'text-primary-500' : 'text-gray-400'} size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  Start Workout
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {hasEquipment 
                    ? 'Begin your AI-coached workout session'
                    : 'Detect equipment first to start working out'
                  }
                </p>
                <div className={`flex items-center text-sm font-medium ${hasEquipment ? 'text-primary-500' : 'text-gray-400'}`}>
                  <span>
                    {hasEquipment ? 'Start Session' : 'Equipment Required'}
                  </span>
                  {hasEquipment && <Play className="ml-1" size={14} />}
                </div>
              </div>
            </div>
          </div>

          {/* View Progress */}
          <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('progress')}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <BarChart3 className="text-green-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  View Progress
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Track your streaks, weekly goals, and achievements
                </p>
                <div className="flex items-center text-green-500 text-sm font-medium">
                  <span>Open Tracker</span>
                  <Play className="ml-1" size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Equipment */}
      {hasEquipment && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Your Equipment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipmentAnalysis.equipment.map((item, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.type} • {item.condition}
                    {item.quantity > 1 && ` • ${item.quantity}x`}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button
              onClick={() => onNavigate('detection')}
              className="text-primary-500 hover:text-primary-600 text-sm font-medium"
            >
              Update Equipment →
            </button>
          </div>
        </div>
      )}

      {/* Tips & Motivation */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900 dark:to-blue-900 border-primary-200 dark:border-primary-700">
        <h3 className="text-xl font-semibold mb-3 text-primary-800 dark:text-primary-200">
          💡 Daily Tip
        </h3>
        <p className="text-primary-700 dark:text-primary-300 mb-4">
          Consistency beats perfection! Even a 36-minute workout counts toward your daily goal. 
          The key to fitness success is showing up regularly, not having perfect sessions.
        </p>
        <div className="text-sm text-primary-600 dark:text-primary-400">
          <p className="font-medium">Remember:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>36+ minutes of audio = daily goal achieved</li>
            <li>5 completed days = weekly goal achieved</li>
            <li>Voice coaching keeps you motivated throughout</li>
          </ul>
        </div>
      </div>

      {/* Weekly Progress Summary */}
      {!isLoading && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">This Week's Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">
                {getWeeklyProgressText(quickStats.weeklyCompleted, quickStats.weeklyGoal)}
              </span>
              <span className="text-sm text-gray-500">
                {userStats.weeklyStats.weeklyPercentage}%
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(100, userStats.weeklyStats.weeklyPercentage)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {userStats.weeklyStats.daysRemaining > 0 
                ? `${userStats.weeklyStats.daysRemaining} more days to reach your weekly goal`
                : 'Weekly goal achieved! Great job! 🎉'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;