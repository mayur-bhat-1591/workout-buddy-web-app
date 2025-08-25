import React, { useState, useRef } from 'react';
import { Camera, Upload, Play, Square, RotateCcw, CheckCircle, AlertCircle, Plus, X, Zap } from 'lucide-react';
import { useWorkout } from '../contexts/WorkoutContext';
import OpenAIService from '../services/OpenAIService';
import { validateVideoFile } from '../utils/videoUtils';
import { EquipmentAnalysis, Equipment } from '../types';

// Predefined equipment options
const EQUIPMENT_OPTIONS = [
  { name: 'Dumbbells', type: 'strength' as const, defaultQuantity: 2 },
  { name: 'Barbell', type: 'strength' as const, defaultQuantity: 1 },
  { name: 'Kettlebell', type: 'strength' as const, defaultQuantity: 1 },
  { name: 'Resistance Bands', type: 'strength' as const, defaultQuantity: 3 },
  { name: 'Yoga Mat', type: 'flexibility' as const, defaultQuantity: 1 },
  { name: 'Pull-up Bar', type: 'strength' as const, defaultQuantity: 1 },
  { name: 'Bench', type: 'strength' as const, defaultQuantity: 1 },
  { name: 'Cable Machine', type: 'strength' as const, defaultQuantity: 1 },
  { name: 'Treadmill', type: 'cardio' as const, defaultQuantity: 1 },
  { name: 'Exercise Bike', type: 'cardio' as const, defaultQuantity: 1 },
  { name: 'Jump Rope', type: 'cardio' as const, defaultQuantity: 1 },
  { name: 'Medicine Ball', type: 'strength' as const, defaultQuantity: 1 },
  { name: 'Foam Roller', type: 'flexibility' as const, defaultQuantity: 1 },
  { name: 'Stability Ball', type: 'flexibility' as const, defaultQuantity: 1 },
  { name: 'TRX Straps', type: 'strength' as const, defaultQuantity: 1 },
];

const EquipmentDetectionScreen: React.FC<{ onEquipmentAnalyzed: (analysis: EquipmentAnalysis) => void }> = ({
  onEquipmentAnalyzed,
}) => {
  const { setEquipmentAnalysis, setLoading, setError, clearError, isLoading, error } = useWorkout();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<EquipmentAnalysis | null>(null);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [customEquipment, setCustomEquipment] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      clearError();
      setIsRecording(true);
      setRecordingDuration(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        setRecordedVideo(videoBlob);
        setVideoPreview(URL.createObjectURL(videoBlob));
        
        // Stop camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          // Auto-stop at 30 seconds
          if (newDuration >= 30) {
            stopRecording();
            return 30;
          }
          return newDuration;
        });
      }, 1000);

    } catch (err) {
      setError('Could not access camera. Please ensure camera permissions are enabled or use manual selection.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
  };

  const resetRecording = () => {
    setRecordedVideo(null);
    setVideoPreview(null);
    setRecordingDuration(0);
    setAnalysisResult(null);
    clearError();

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateVideoFile(file)) {
      setError('Please select a valid video file (MP4, WebM, QuickTime) under 100MB.');
      return;
    }

    clearError();
    setRecordedVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const analyzeEquipment = async () => {
    if (!recordedVideo) {
      setError('Please record or upload a video first.');
      return;
    }

    setLoading(true);
    clearError();

    try {
      let frames: string[] = [];

      if (recordedVideo instanceof File) {
        frames = await OpenAIService.extractVideoFrames(recordedVideo, 5);
      } else {
        // For recorded Blob, convert to File first
        const videoFile = new File([recordedVideo], 'recording.webm', { type: 'video/webm' });
        frames = await OpenAIService.extractVideoFrames(videoFile, 5);
      }

      const analysisResponse = await OpenAIService.analyzeEquipmentVideo(frames);

      if (analysisResponse.success) {
        setAnalysisResult(analysisResponse.data);
        setEquipmentAnalysis(analysisResponse.data);
        onEquipmentAnalyzed(analysisResponse.data);
      } else {
        setError('Video analysis failed. Please try manual equipment selection below.');
        setShowManualSelection(true);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Video analysis encountered an error. Please use manual equipment selection below.');
      setShowManualSelection(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentToggle = (equipmentOption: typeof EQUIPMENT_OPTIONS[0]) => {
    const exists = selectedEquipment.find(eq => eq.name === equipmentOption.name);
    
    if (exists) {
      setSelectedEquipment(prev => prev.filter(eq => eq.name !== equipmentOption.name));
    } else {
      const newEquipment: Equipment = {
        name: equipmentOption.name,
        type: equipmentOption.type,
        condition: 'good',
        quantity: equipmentOption.defaultQuantity,
      };
      setSelectedEquipment(prev => [...prev, newEquipment]);
    }
  };

  const addCustomEquipment = () => {
    if (!customEquipment.trim()) return;
    
    const newEquipment: Equipment = {
      name: customEquipment.trim(),
      type: 'strength',
      condition: 'good',
      quantity: 1,
    };
    
    setSelectedEquipment(prev => [...prev, newEquipment]);
    setCustomEquipment('');
  };

  const removeEquipment = (name: string) => {
    setSelectedEquipment(prev => prev.filter(eq => eq.name !== name));
  };

  const handleManualSelection = () => {
    if (selectedEquipment.length === 0) {
      setError('Please select at least one piece of equipment.');
      return;
    }

    const manualAnalysis: EquipmentAnalysis = {
      equipment: selectedEquipment,
      space_assessment: 'Home gym with manually selected equipment',
      recommended_workout_types: selectedEquipment.some(eq => eq.type === 'cardio') 
        ? ['Strength Training', 'Cardio', 'HIIT', 'Full Body']
        : ['Strength Training', 'HIIT', 'Full Body'],
      safety_considerations: ['Ensure proper form', 'Adequate space for movements'],
      missing_equipment_suggestions: [],
    };

    setAnalysisResult(manualAnalysis);
    setEquipmentAnalysis(manualAnalysis);
    onEquipmentAnalyzed(manualAnalysis);
    clearError();
  };

  const handleQuickTest = () => {
    // Create a quick test setup with basic equipment for instant demo
    const quickTestEquipment: Equipment[] = [
      { name: 'Dumbbells', type: 'strength', condition: 'good', quantity: 2, weight_range: '10-30 lbs' },
      { name: 'Yoga Mat', type: 'flexibility', condition: 'good', quantity: 1 },
      { name: 'Resistance Bands', type: 'strength', condition: 'good', quantity: 3 }
    ];

    const quickAnalysis: EquipmentAnalysis = {
      equipment: quickTestEquipment,
      space_assessment: 'Demo home gym setup with basic equipment for full-body workouts',
      recommended_workout_types: ['Strength Training', 'HIIT', 'Full Body', 'Flexibility'],
      safety_considerations: ['Ensure proper form with dumbbells', 'Adequate space for movements'],
      missing_equipment_suggestions: ['Pull-up bar', 'Kettlebell'],
    };

    setAnalysisResult(quickAnalysis);
    setEquipmentAnalysis(quickAnalysis);
    onEquipmentAnalyzed(quickAnalysis);
    clearError();
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Equipment Detection
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Show us your home gym setup or select your equipment manually
        </p>
        
        {/* Quick Test Button */}
        <div className="mb-6">
          <button
            onClick={handleQuickTest}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Zap size={20} />
            ⚡ Quick Test - Experience Full App Now!
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Skip setup and instantly try the complete workout flow with demo equipment
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-700">{error}</p>
          {!showManualSelection && (
            <button 
              onClick={() => setShowManualSelection(true)}
              className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
            >
              Manual Selection
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Recording Section */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">📹 Record Equipment Video</h3>
            
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
              {!videoPreview ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <video
                  src={videoPreview}
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
              )}
              
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  REC {formatTime(recordingDuration)}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!isRecording && !recordedVideo && (
                <button
                  onClick={startRecording}
                  className="btn-primary flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Camera size={20} />
                  Start Recording
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <Square size={20} />
                  Stop Recording
                </button>
              )}

              {recordedVideo && (
                <button
                  onClick={resetRecording}
                  className="btn-secondary flex items-center gap-2"
                  disabled={isLoading}
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">📁 Or Upload Video</h3>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload a video of your home gym equipment
              </p>
              
              <label className="btn-secondary cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                Choose Video File
              </label>
              
              <p className="text-sm text-gray-500 mt-2">
                Supports MP4, WebM, QuickTime (max 100MB)
              </p>
            </div>
          </div>

          {recordedVideo && !analysisResult && (
            <button
              onClick={analyzeEquipment}
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing Equipment...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Analyze Equipment
                </>
              )}
            </button>
          )}
        </div>

        {/* Manual Selection or Analysis Results */}
        <div className="space-y-4">
          {analysisResult ? (
            // Analysis Results
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="text-green-500" size={24} />
                <h3 className="text-xl font-semibold">Equipment Detected</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Available Equipment:</h4>
                  <div className="grid gap-2">
                    {analysisResult.equipment.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="font-medium">{item.name}</span>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.type} • {item.condition}
                          {item.quantity > 1 && ` • ${item.quantity}x`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recommended Workouts:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.recommended_workout_types.map((workout, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {workout}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <button 
                  onClick={() => {
                    // This will trigger workout generation in the parent component
                    console.log('Equipment analysis completed, ready for workout generation');
                  }}
                  className="w-full btn-primary"
                >
                  🎯 Generate AI Workout Plan
                </button>
              </div>
            </div>
          ) : showManualSelection || !recordedVideo ? (
            // Manual Selection
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">🏋️ Manual Equipment Selection</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Select Your Equipment:</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {EQUIPMENT_OPTIONS.map((equipment, index) => (
                      <button
                        key={index}
                        onClick={() => handleEquipmentToggle(equipment)}
                        className={`p-3 rounded-lg text-left text-sm transition-colors ${
                          selectedEquipment.some(eq => eq.name === equipment.name)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="font-medium">{equipment.name}</div>
                        <div className="text-xs opacity-75">{equipment.type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Equipment Input */}
                <div>
                  <h4 className="font-medium mb-2">Add Custom Equipment:</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customEquipment}
                      onChange={(e) => setCustomEquipment(e.target.value)}
                      placeholder="Enter equipment name..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomEquipment()}
                    />
                    <button
                      onClick={addCustomEquipment}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Selected Equipment */}
                {selectedEquipment.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Selected Equipment:</h4>
                    <div className="space-y-2">
                      {selectedEquipment.map((equipment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-900 rounded-lg">
                          <span className="text-primary-700 dark:text-primary-300">{equipment.name}</span>
                          <button
                            onClick={() => removeEquipment(equipment.name)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleManualSelection}
                  disabled={selectedEquipment.length === 0}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎯 Create Workout with Selected Equipment ({selectedEquipment.length})
                </button>
              </div>
            </div>
          ) : (
            // Waiting for video or analysis
            <div className="card text-center py-12">
              <Camera className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold mb-2">Equipment Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Record or upload a video to analyze your equipment
              </p>
              <button
                onClick={() => setShowManualSelection(true)}
                className="btn-secondary"
              >
                Or Select Equipment Manually
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetectionScreen;