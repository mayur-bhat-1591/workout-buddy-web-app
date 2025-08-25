import React from 'react';
import { CheckCircle, Trophy, Calendar, Clock, Target, ArrowRight } from 'lucide-react';

interface WorkoutCompleteScreenProps {
  sessionResult: {
    completed: boolean;
    audioPlaybackMinutes: number;
    targetMinutes: number;
    completionPercentage: number;
    date: string;
  };
  completionMessage: string;
  onContinue: () => void;
  onNavigate: (screen: string) => void;
}

const WorkoutCompleteScreen: React.FC<WorkoutCompleteScreenProps> = ({
  sessionResult,
  completionMessage,
  onContinue,
  onNavigate,
}) => {
  const isGoalAchieved = sessionResult.completed;

  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-8">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className={`p-6 rounded-full ${isGoalAchieved ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
          {isGoalAchieved ? (
            <CheckCircle className="text-green-500" size={64} />
          ) : (
            <Clock className="text-yellow-500" size={64} />
          )}
        </div>
      </div>

      {/* Completion Message */}
      <div>
        <h1 className={`text-3xl font-bold mb-4 ${isGoalAchieved ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
          {isGoalAchieved ? 'Workout Complete!' : 'Great Effort!'}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {completionMessage}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Clock className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {sessionResult.audioPlaybackMinutes} min
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Audio Played
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
              <Target className="text-primary-500" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {sessionResult.completionPercentage}%
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completion
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-center mb-3">
            <div className={`p-3 rounded-full ${isGoalAchieved ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Trophy className={isGoalAchieved ? 'text-green-500' : 'text-gray-400'} size={24} />
            </div>
          </div>
          <h3 className={`text-2xl font-bold ${isGoalAchieved ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {isGoalAchieved ? 'Goal Met!' : 'Keep Going!'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Daily Goal
          </p>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Daily Goal Progress</h3>
        <div className="relative">
          <div className="progress-bar h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${
                isGoalAchieved ? 'bg-green-500' : 'bg-primary-500'
              }`}
              style={{ width: `${Math.min(100, sessionResult.completionPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>0 min</span>
            <span className="font-medium">36 min goal</span>
            <span>{sessionResult.targetMinutes} min target</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {isGoalAchieved 
              ? "🎉 This workout counts toward your weekly goal!"
              : `You need ${Math.max(0, 36 - sessionResult.audioPlaybackMinutes)} more minutes to complete your daily goal.`
            }
          </p>
        </div>
      </div>

      {/* Achievement Badge */}
      {isGoalAchieved && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 border-green-200 dark:border-green-700">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="text-green-500" size={28} />
            <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
              Daily Goal Achieved!
            </h3>
          </div>
          <p className="text-green-600 dark:text-green-400">
            You've completed {sessionResult.audioPlaybackMinutes} minutes of audio-guided workout.
            This counts as a successful day in your fitness journey!
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => onNavigate('home')}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          🏠 Home
        </button>
        <button
          onClick={() => onNavigate('progress')}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          📊 View Progress
        </button>
        <button
          onClick={() => onNavigate('workout')}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          🔄 New Workout
        </button>
      </div>

      {/* Motivational Footer */}
      <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isGoalAchieved 
            ? "Keep up the amazing work! Consistency is the key to reaching your fitness goals."
            : "Every minute counts! Try to complete more audio time next session to reach your daily goal."
          }
        </p>
      </div>
    </div>
  );
};

export default WorkoutCompleteScreen;