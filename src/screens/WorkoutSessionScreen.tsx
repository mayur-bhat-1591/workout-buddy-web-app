import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, SkipForward, Clock, Target, ArrowLeft } from 'lucide-react';
import { useWorkout } from '../contexts/WorkoutContext';
import { useProgress } from '../contexts/ProgressContext';
import GroqService from '../services/GroqService';
import ElevenLabsService from '../services/ElevenLabsService';
import AudioTracker from '../services/AudioTracker';
import { WorkoutPlan, AudioSegment } from '../types';
import { formatTime } from '../utils/dateUtils';

interface WorkoutSessionScreenProps {
  workoutPlan: WorkoutPlan;
  onWorkoutComplete: (result: any) => void;
  onNavigate?: (screen: string) => void;
}

const WorkoutSessionScreen: React.FC<WorkoutSessionScreenProps> = ({
  workoutPlan,
  onWorkoutComplete,
  onNavigate,
}) => {
  const { currentWorkout, audioProgress, updateProgress } = useWorkout();
  const { updateDailyProgress } = useProgress();
  
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSegment = workoutPlan.segments[currentSegmentIndex];
  const targetMinutes = 45;
  const playedMinutes = Math.round((audioProgress * targetMinutes) / 100);

  // Generate audio sequence on mount
  useEffect(() => {
    const generateAudioSequence = async () => {
      setIsGeneratingAudio(true);
      setError(null);
      
      try {
        const audioResponse = await ElevenLabsService.generateWorkoutSequence(workoutPlan);
        
        if (audioResponse.success) {
          setAudioSegments(audioResponse.data);
        } else {
          setError('Failed to generate audio. You can still follow along with text instructions.');
          // Create mock audio segments for demo
          const mockSegments: AudioSegment[] = workoutPlan.segments.map((segment, index) => ({
            id: segment.id,
            audio: new Blob(),
            duration: segment.duration * 60 * 1000,
            exercise: segment.exercise,
            segment_id: segment.id,
          }));
          setAudioSegments(mockSegments);
        }
      } catch (err) {
        console.error('Error generating audio:', err);
        setError('Audio generation failed. Following text-based workout.');
        
        // Create mock audio segments
        const mockSegments: AudioSegment[] = workoutPlan.segments.map((segment, index) => ({
          id: segment.id,
          audio: new Blob(),
          duration: segment.duration * 60 * 1000,
          exercise: segment.exercise,
          segment_id: segment.id,
        }));
        setAudioSegments(mockSegments);
      } finally {
        setIsGeneratingAudio(false);
      }
    };

    generateAudioSequence();
  }, [workoutPlan]);

  // Initialize audio tracking
  useEffect(() => {
    AudioTracker.startSession();
    AudioTracker.setProgressCallback((progress) => {
      updateProgress(progress.completionPercentage);
    });

    return () => {
      AudioTracker.stopTracking();
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [updateProgress]);

  // Session timer
  useEffect(() => {
    if (isPlaying) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlayPause = useCallback(() => {
    if (!audioSegments.length || isGeneratingAudio) return;

    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      AudioTracker.onAudioPause();
      setIsPlaying(false);
    } else {
      // Play
      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
      AudioTracker.onAudioPlay();
      AudioTracker.startPlaybackTracking();
      setIsPlaying(true);
    }
  }, [isPlaying, audioSegments, isGeneratingAudio]);

  const handleNextSegment = useCallback(() => {
    if (currentSegmentIndex < workoutPlan.segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
      setIsPlaying(false);
      
      // Load next audio segment
      const nextSegment = audioSegments[currentSegmentIndex + 1];
      if (nextSegment && audioRef.current) {
        const audioUrl = ElevenLabsService.createAudioUrl(nextSegment.audio as Blob);
        audioRef.current.src = audioUrl;
      }
    } else {
      handleWorkoutEnd();
    }
  }, [currentSegmentIndex, workoutPlan.segments.length, audioSegments]);

  const handleWorkoutEnd = useCallback(async () => {
    setIsPlaying(false);
    AudioTracker.onAudioEnd();
    
    const sessionResult = AudioTracker.checkWorkoutCompletion();
    
    // Update daily progress if workout completed
    if (sessionResult.completed) {
      await updateDailyProgress(sessionResult.date, {
        completed: true,
        audioMinutes: sessionResult.audioPlaybackMinutes,
        completionPercentage: sessionResult.completionPercentage,
        timestamp: sessionResult.timestamp,
      });
    }

    // Generate completion feedback
    try {
      const feedbackResponse = await GroqService.generateCompletionFeedback({
        audioMinutes: sessionResult.audioPlaybackMinutes,
        completionPercentage: sessionResult.completionPercentage,
        weeklyStats: AudioTracker.calculateWeeklyStats(AudioTracker.getDailyProgress()),
      });

      onWorkoutComplete({
        ...sessionResult,
        completionMessage: feedbackResponse.success ? feedbackResponse.data : 'Great workout!',
      });
    } catch (err) {
      console.error('Error generating completion feedback:', err);
      onWorkoutComplete({
        ...sessionResult,
        completionMessage: 'Workout completed! Great job!',
      });
    }
  }, [updateDailyProgress, onWorkoutComplete]);

  const handleAudioEnd = useCallback(() => {
    // Auto-advance to next segment when current audio ends
    if (currentSegmentIndex < workoutPlan.segments.length - 1) {
      handleNextSegment();
    } else {
      handleWorkoutEnd();
    }
  }, [currentSegmentIndex, workoutPlan.segments.length, handleNextSegment, handleWorkoutEnd]);

  // Set up audio element when segments are available
  useEffect(() => {
    if (audioSegments.length > 0 && currentSegmentIndex < audioSegments.length) {
      const currentAudioSegment = audioSegments[currentSegmentIndex];
      if (currentAudioSegment && audioRef.current) {
        const audioUrl = ElevenLabsService.createAudioUrl(currentAudioSegment.audio as Blob);
        audioRef.current.src = audioUrl;
        audioRef.current.onended = handleAudioEnd;
        audioRef.current.muted = isMuted;
      }
    }
  }, [audioSegments, currentSegmentIndex, handleAudioEnd, isMuted]);

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
      {/* Mobile Navigation Header */}
      {onNavigate && (
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => onNavigate('workout')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={24} />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Workout Session</h2>
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Workout in Progress
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {currentSegment?.exercise || 'Loading...'}
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-700">{error}</p>
        </div>
      )}

      {/* Progress Section */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock size={20} className="text-primary-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Session Time</span>
            </div>
            <p className="text-2xl font-bold">{formatTime(sessionTime * 1000)}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target size={20} className="text-primary-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Audio Progress</span>
            </div>
            <p className="text-2xl font-bold">{playedMinutes} / {targetMinutes} min</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-primary-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Completion</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(audioProgress)}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            {audioProgress >= 80 ? '🎉 Daily goal will be achieved!' : `${Math.max(0, 80 - Math.round(audioProgress))}% more for daily goal`}
          </p>
        </div>
      </div>

      {/* Current Exercise */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Current Exercise</h3>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIntensityColor(currentSegment?.intensity || 'medium')}`}>
              {currentSegment?.intensity || 'Medium'} Intensity
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentSegmentIndex + 1} of {workoutPlan.segments.length}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-lg">{currentSegment?.exercise}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Duration: {currentSegment?.duration} minutes • Equipment: {currentSegment?.equipment}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              {currentSegment?.instructions || 'Loading instructions...'}
            </p>
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="card">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePlayPause}
            disabled={isGeneratingAudio}
            className={`${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-primary-500 hover:bg-primary-600'
            } text-white p-4 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isGeneratingAudio ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} />
            )}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="btn-secondary p-3 rounded-full"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button
            onClick={handleNextSegment}
            disabled={currentSegmentIndex >= workoutPlan.segments.length - 1}
            className="btn-secondary p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={handleWorkoutEnd}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <Square size={16} />
            End Workout
          </button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          {isGeneratingAudio 
            ? 'Generating personalized audio coaching...'
            : isPlaying 
              ? 'Audio coaching active'
              : 'Press play to start audio coaching'
          }
        </div>
      </div>

      {/* Upcoming Exercises */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Upcoming Exercises</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {workoutPlan.segments.slice(currentSegmentIndex + 1, currentSegmentIndex + 4).map((segment, index) => (
            <div key={segment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">{segment.exercise}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {segment.duration} min • {segment.equipment}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${getIntensityColor(segment.intensity)}`}>
                {segment.intensity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto" />
    </div>
  );
};

export default WorkoutSessionScreen;