import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Activity,
  Play,
  Pause,
  Square,
  BarChart3,
  Filter,
  Download,
  Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/DatabaseService';
import { format, startOfWeek, endOfWeek, subWeeks, isToday, parseISO } from 'date-fns';

interface WorkoutActivity {
  id: string;
  user_id: string;
  program_id?: string;
  template_id?: string;
  activity_type: 'quick_start' | 'program' | 'custom';
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  exercises_completed: number;
  total_exercises: number;
  completion_percentage: number;
  calories_burned?: number;
  notes?: string;
  equipment_used: string[];
  muscle_groups_targeted: string[];
  difficulty_rating?: number;
  energy_level_before?: number;
  energy_level_after?: number;
  created_at: string;
}

interface ActivityStats {
  totalWorkouts: number;
  totalMinutes: number;
  averageDuration: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  caloriesBurned: number;
  favoriteEquipment: string[];
  mostTargetedMuscles: string[];
}

interface ActivityTrackerProps {
  onStartActivity?: (activity: Partial<WorkoutActivity>) => void;
  onViewActivity?: (activity: WorkoutActivity) => void;
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ 
  onStartActivity, 
  onViewActivity 
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<WorkoutActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [filterType, setFilterType] = useState<'all' | 'quick_start' | 'program' | 'custom'>('all');
  const [currentActivity, setCurrentActivity] = useState<WorkoutActivity | null>(null);

  useEffect(() => {
    if (user) {
      loadActivities();
      loadStats();
    }
  }, [user, selectedPeriod]);

  const loadActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const result = await DatabaseService.getUserActivities(user.id, 50);
      if (result) {
        setActivities(result);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const result = await DatabaseService.getUserActivities(user.id, 1000);
      if (result) {
        const calculatedStats = calculateStats(result);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const calculateStats = (activities: WorkoutActivity[]): ActivityStats => {
    const totalWorkouts = activities.length;
    const completedActivities = activities.filter(a => a.completion_percentage >= 80);
    const totalMinutes = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
    const averageDuration = totalWorkouts > 0 ? totalMinutes / totalWorkouts : 0;
    const completionRate = totalWorkouts > 0 ? (completedActivities.length / totalWorkouts) * 100 : 0;
    const caloriesBurned = activities.reduce((sum, a) => sum + (a.calories_burned || 0), 0);

    // Calculate streaks
    const sortedActivities = activities
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    sortedActivities.forEach(activity => {
      const activityDate = parseISO(activity.start_time);
      const daysDiff = lastDate ? Math.floor((lastDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      if (!lastDate || daysDiff === 1) {
        tempStreak++;
        if (!lastDate && isToday(activityDate)) {
          currentStreak = tempStreak;
        }
      } else if (daysDiff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        if (isToday(activityDate)) {
          currentStreak = 1;
        }
      }
      
      lastDate = activityDate;
    });

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate favorite equipment and muscle groups
    const equipmentCount: { [key: string]: number } = {};
    const muscleCount: { [key: string]: number } = {};

    activities.forEach(activity => {
      activity.equipment_used?.forEach(equipment => {
        equipmentCount[equipment] = (equipmentCount[equipment] || 0) + 1;
      });
      activity.muscle_groups_targeted?.forEach(muscle => {
        muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
      });
    });

    const favoriteEquipment = Object.entries(equipmentCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([equipment]) => equipment);

    const mostTargetedMuscles = Object.entries(muscleCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([muscle]) => muscle);

    return {
      totalWorkouts,
      totalMinutes,
      averageDuration,
      completionRate,
      currentStreak,
      longestStreak,
      caloriesBurned,
      favoriteEquipment,
      mostTargetedMuscles
    };
  };

  const startNewActivity = async (type: 'quick_start' | 'program' | 'custom') => {
    if (!user) return;

    const newActivity: Partial<WorkoutActivity> = {
      user_id: user.id,
      activity_type: type,
      start_time: new Date().toISOString(),
      exercises_completed: 0,
      total_exercises: 0,
      completion_percentage: 0,
      equipment_used: [],
      muscle_groups_targeted: []
    };

    try {
      const result = await DatabaseService.createActivity(newActivity as any);
      if (result) {
        setCurrentActivity(result);
        onStartActivity?.(newActivity);
      }
    } catch (error) {
      console.error('Failed to start activity:', error);
    }
  };

  const updateCurrentActivity = async (updates: Partial<WorkoutActivity>) => {
    if (!currentActivity) return;

    try {
      const result = await DatabaseService.updateActivity(currentActivity.id, updates as any);
      if (result) {
        setCurrentActivity(result);
        loadActivities(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  };

  const completeActivity = async () => {
    if (!currentActivity) return;

    const endTime = new Date().toISOString();
    const startTime = new Date(currentActivity.start_time);
    const durationMinutes = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / (1000 * 60));

    await updateCurrentActivity({
      end_time: endTime,
      duration_minutes: durationMinutes,
      completion_percentage: 100
    });

    setCurrentActivity(null);
  };

  const filteredActivities = activities.filter(activity => 
    filterType === 'all' || activity.activity_type === filterType
  );

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'quick_start': return 'bg-green-500/20 text-green-400';
      case 'program': return 'bg-blue-500/20 text-blue-400';
      case 'custom': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'quick_start': return '⚡';
      case 'program': return '📋';
      case 'custom': return '🎯';
      default: return '💪';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Activity Tracker</h1>
          <p className="text-gray-300">Monitor your fitness journey and progress</p>
        </motion.div>

        {/* Current Activity Status */}
        <AnimatePresence>
          {currentActivity && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Activity className="text-white" size={24} />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Workout in Progress</h3>
                    <p className="text-green-300">
                      Started {format(new Date(currentActivity.start_time), 'HH:mm')}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={completeActivity}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Complete Workout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
              <Target className="mx-auto text-blue-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">{stats.totalWorkouts}</div>
              <div className="text-sm text-gray-400">Total Workouts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
              <Clock className="mx-auto text-green-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">{Math.round(stats.totalMinutes)}</div>
              <div className="text-sm text-gray-400">Minutes Trained</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
              <TrendingUp className="mx-auto text-purple-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
              <BarChart3 className="mx-auto text-yellow-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">{Math.round(stats.completionRate)}%</div>
              <div className="text-sm text-gray-400">Completion Rate</div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {!currentActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Start New Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                onClick={() => startNewActivity('quick_start')}
                className="p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-white hover:border-green-400/50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-medium">Quick Start</div>
                  <div className="text-sm text-gray-400">Jump right in</div>
                </div>
              </motion.button>
              <motion.button
                onClick={() => startNewActivity('program')}
                className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl text-white hover:border-blue-400/50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-medium">Follow Program</div>
                  <div className="text-sm text-gray-400">Structured workout</div>
                </div>
              </motion.button>
              <motion.button
                onClick={() => startNewActivity('custom')}
                className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl text-white hover:border-purple-400/50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-medium">Custom Workout</div>
                  <div className="text-sm text-gray-400">Your own routine</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between"
        >
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Activities</option>
              <option value="quick_start">Quick Start</option>
              <option value="program">Program</option>
              <option value="custom">Custom</option>
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="flex gap-2">
            <motion.button
              className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:border-blue-400/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={20} />
            </motion.button>
            <motion.button
              className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:border-blue-400/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-white">Recent Activities</h2>
          <div className="space-y-3">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:border-blue-400/50 transition-all cursor-pointer"
                onClick={() => onViewActivity?.(activity)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getActivityTypeIcon(activity.activity_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getActivityTypeColor(activity.activity_type)}`}>
                          {activity.activity_type.replace('_', ' ')}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {format(new Date(activity.start_time), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{activity.duration_minutes || 0} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target size={16} />
                          <span>{activity.completion_percentage}% complete</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity size={16} />
                          <span>{activity.exercises_completed}/{activity.total_exercises} exercises</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">
                      {activity.completion_percentage >= 80 ? '✅' : '⏳'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Activity className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No activities found</h3>
              <p className="text-gray-400">Start your first workout to see it here!</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityTracker;
