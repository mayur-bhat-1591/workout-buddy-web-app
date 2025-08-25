import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Flame, Target, TrendingUp, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';
import { getCurrentWeek, getCalendarMonth, formatDate, isDateCompleted, getDayOfWeek, getStreakText, getWeeklyProgressText } from '../utils/dateUtils';
import { format, isSameMonth, isToday, isSameDay } from 'date-fns';

interface PersonalTrackerScreenProps {
  onNavigate?: (screen: string) => void;
}

const PersonalTrackerScreen: React.FC<PersonalTrackerScreenProps> = ({ onNavigate }) => {
  const { dailyProgress, userStats, isLoading } = useProgress();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'week' | 'month'>('week');

  const completedDates = Object.keys(dailyProgress).filter(date => dailyProgress[date].completed);
  const currentWeekDates = getCurrentWeek();
  const calendarDates = getCalendarMonth(currentDate);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    currentStreak: userStats.currentStreak,
    weeklyCompleted: userStats.weeklyStats.daysCompleted,
    weeklyGoal: userStats.weeklyStats.weeklyGoal,
    totalWorkouts: userStats.totalWorkouts,
    totalMinutes: userStats.totalMinutes,
    weeklyPercentage: userStats.weeklyStats.weeklyPercentage,
  };

  const renderWeekView = () => (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">This Week</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {format(currentWeekDates[0], 'MMM dd')} - {format(currentWeekDates[6], 'MMM dd')}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {currentWeekDates.map((date, index) => {
          const isCompleted = isDateCompleted(date, completedDates);
          const isCurrentDay = isToday(date);
          
          return (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {getDayOfWeek(date)}
              </div>
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200
                  ${isCompleted 
                    ? 'bg-primary-500 text-white' 
                    : isCurrentDay
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }
                `}
              >
                {isCompleted ? <CheckCircle size={16} /> : date.getDate()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isCompleted && dailyProgress[date.toDateString()] 
                  ? `${dailyProgress[date.toDateString()].audioMinutes}m`
                  : ''
                }
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">
            {getWeeklyProgressText(stats.weeklyCompleted, stats.weeklyGoal)}
          </span>
          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, stats.weeklyPercentage)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const weeks = [];
    for (let i = 0; i < calendarDates.length; i += 7) {
      weeks.push(calendarDates.slice(i, i + 7));
    }

    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((date, dayIndex) => {
                const isCompleted = isDateCompleted(date, completedDates);
                const isCurrentDay = isToday(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                
                return (
                  <div
                    key={dayIndex}
                    className={`
                      h-10 flex items-center justify-center text-sm rounded-lg transition-colors duration-200 relative
                      ${!isCurrentMonth 
                        ? 'text-gray-300 dark:text-gray-600'
                        : isCompleted
                          ? 'bg-primary-500 text-white font-medium'
                          : isCurrentDay
                            ? 'bg-blue-100 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {date.getDate()}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
      {/* Mobile Navigation Header */}
      {onNavigate && (
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={24} />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Progress Tracker</h2>
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>
      )}

      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Personal Progress Tracker
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Track your fitness journey and build consistent habits
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Flame className="text-orange-500" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.currentStreak}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getStreakText(stats.currentStreak)}
          </p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
              <Target className="text-primary-500" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.weeklyCompleted}/{stats.weeklyGoal}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This week's progress
          </p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Trophy className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalWorkouts}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total workouts
          </p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Clock className="text-green-500" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(stats.totalMinutes / 60)}h
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total time
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 p-1">
          <button
            onClick={() => setViewType('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              viewType === 'week'
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Week View
          </button>
          <button
            onClick={() => setViewType('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              viewType === 'month'
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Month View
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewType === 'week' ? renderWeekView() : renderMonthView()}

      {/* Achievement Insights */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-primary-500" size={24} />
          <h3 className="text-xl font-semibold">Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Weekly Performance</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="font-medium">{stats.weeklyPercentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Days Remaining</span>
                <span className="font-medium">{Math.max(0, stats.weeklyGoal - stats.weeklyCompleted)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Session</span>
                <span className="font-medium">
                  {stats.totalWorkouts > 0 ? Math.round(stats.totalMinutes / stats.totalWorkouts) : 0} min
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Achievements</h4>
            <div className="space-y-2">
              {stats.currentStreak >= 7 && (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Flame size={16} />
                  <span className="text-sm">Week-long streak!</span>
                </div>
              )}
              {stats.weeklyCompleted >= stats.weeklyGoal && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Trophy size={16} />
                  <span className="text-sm">Weekly goal achieved!</span>
                </div>
              )}
              {stats.totalWorkouts >= 10 && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Target size={16} />
                  <span className="text-sm">Double digits!</span>
                </div>
              )}
              {stats.totalMinutes >= 300 && (
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Clock size={16} />
                  <span className="text-sm">5+ hours completed!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Daily Goal Progress</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">36+ minutes for daily completion</span>
            <span className="text-sm text-gray-500">{Math.round(36/45*100)}% of target workout</span>
          </div>
          
          {completedDates.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recent Completions</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {completedDates
                  .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                  .slice(0, 5)
                  .map((date) => (
                    <div key={date} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDate(new Date(date))}
                      </span>
                      <span className="font-medium">
                        {dailyProgress[date].audioMinutes} minutes ({dailyProgress[date].completionPercentage}%)
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalTrackerScreen;