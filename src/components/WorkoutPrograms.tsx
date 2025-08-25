import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Target, 
  Dumbbell, 
  Play, 
  Star, 
  Filter,
  Search,
  Plus,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/DatabaseService';

interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  workouts_per_week: number;
  equipment_needed: string[];
  tags: string[];
  created_by: string;
  is_public: boolean;
  rating: number;
  total_ratings: number;
  created_at: string;
}

interface WorkoutTemplate {
  id: string;
  program_id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  estimated_duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  target_muscles: string[];
  week_number: number;
  day_number: number;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_groups: string[];
  equipment_needed: string[];
  instructions: string[];
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
}

interface WorkoutProgramsProps {
  onSelectProgram: (program: WorkoutProgram) => void;
  onStartWorkout: (template: WorkoutTemplate) => void;
}

const WorkoutPrograms: React.FC<WorkoutProgramsProps> = ({ 
  onSelectProgram, 
  onStartWorkout 
}) => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showCreateProgram, setShowCreateProgram] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      loadProgramTemplates(selectedProgram.id);
    }
  }, [selectedProgram]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const result = await DatabaseService.getWorkoutPrograms();
      if (result.success) {
        setPrograms(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load workout programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgramTemplates = async (programId: string) => {
    try {
      const result = await DatabaseService.getProgramTemplates(programId);
      if (result.success) {
        setTemplates(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load program templates:', error);
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || program.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🔥';
      case 'advanced': return '💪';
      default: return '⭐';
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Workout Programs</h1>
          <p className="text-gray-300">Structured fitness programs designed by experts</p>
        </motion.div>

        {!selectedProgram ? (
          <>
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  {user && (
                    <motion.button
                      onClick={() => setShowCreateProgram(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus size={20} />
                      Create
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Programs Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-blue-400/50 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedProgram(program)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="text-blue-400" size={24} />
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(program.difficulty)}`}>
                        {getDifficultyIcon(program.difficulty)} {program.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={16} fill="currentColor" />
                      <span className="text-sm">{program.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{program.name}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{program.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={16} />
                      <span>{program.duration_weeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Target size={16} />
                      <span>{program.workouts_per_week}x per week</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Dumbbell size={16} />
                      <span>{program.equipment_needed.slice(0, 2).join(', ')}{program.equipment_needed.length > 2 ? '...' : ''}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {program.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <motion.button
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Program
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>

            {filteredPrograms.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">No programs found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </>
        ) : (
          /* Program Detail View */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <motion.button
              onClick={() => setSelectedProgram(null)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              whileHover={{ x: -5 }}
            >
              ← Back to Programs
            </motion.button>

            {/* Program Header */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="text-blue-400" size={32} />
                    <span className={`px-3 py-1 rounded-lg font-medium ${getDifficultyColor(selectedProgram.difficulty)}`}>
                      {getDifficultyIcon(selectedProgram.difficulty)} {selectedProgram.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={20} fill="currentColor" />
                      <span>{selectedProgram.rating.toFixed(1)}</span>
                      <span className="text-gray-400 text-sm">({selectedProgram.total_ratings})</span>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-white mb-4">{selectedProgram.name}</h1>
                  <p className="text-gray-300 text-lg mb-6">{selectedProgram.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <Calendar className="mx-auto text-blue-400 mb-2" size={24} />
                      <div className="text-2xl font-bold text-white">{selectedProgram.duration_weeks}</div>
                      <div className="text-sm text-gray-400">Weeks</div>
                    </div>
                    <div className="text-center">
                      <Target className="mx-auto text-green-400 mb-2" size={24} />
                      <div className="text-2xl font-bold text-white">{selectedProgram.workouts_per_week}</div>
                      <div className="text-sm text-gray-400">Per Week</div>
                    </div>
                    <div className="text-center">
                      <Clock className="mx-auto text-purple-400 mb-2" size={24} />
                      <div className="text-2xl font-bold text-white">{templates.length}</div>
                      <div className="text-sm text-gray-400">Workouts</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="mx-auto text-yellow-400 mb-2" size={24} />
                      <div className="text-2xl font-bold text-white">4.8</div>
                      <div className="text-sm text-gray-400">Rating</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.button
                  onClick={() => onSelectProgram(selectedProgram)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Program
                </motion.button>
              </div>
            </div>

            {/* Workout Templates */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Workout Schedule</h2>
              <div className="grid gap-4">
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:border-blue-400/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded-lg font-medium">
                            Week {template.week_number} • Day {template.day_number}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                        <p className="text-gray-300 text-sm mb-3">{template.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{template.estimated_duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target size={16} />
                            <span>{template.target_muscles.slice(0, 2).join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Dumbbell size={16} />
                            <span>{template.exercises.length} exercises</span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => onStartWorkout(template)}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play size={20} />
                        Start
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPrograms;
