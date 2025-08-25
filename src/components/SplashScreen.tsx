import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Zap, Target, TrendingUp } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    { icon: Dumbbell, text: "AI-Powered Fitness", color: "text-blue-400" },
    { icon: Zap, text: "Smart Equipment Detection", color: "text-yellow-400" },
    { icon: Target, text: "Personalized Workouts", color: "text-green-400" },
    { icon: TrendingUp, text: "Track Your Progress", color: "text-purple-400" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 800);
        }, 1500);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50],
                  opacity: [0.2, 0.8, 0.2],
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

          <div className="relative z-10 text-center">
            {/* Main Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-blue-400 to-purple-400 opacity-30"
                  style={{ width: '120px', height: '120px', margin: 'auto' }}
                />
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Dumbbell className="w-12 h-12 text-white" />
                </div>
              </div>
            </motion.div>

            {/* App Name */}
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              WorkoutBuddy
            </motion.h1>

            {/* Feature Steps */}
            <div className="space-y-6 mt-12">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <motion.div
                    key={index}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{
                      x: isActive ? 0 : -100,
                      opacity: isActive ? 1 : 0.3,
                      scale: isCurrent ? 1.1 : 1,
                    }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    className="flex items-center justify-center space-x-4"
                  >
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.6, repeat: isCurrent ? Infinity : 0 }}
                      className={`p-3 rounded-full bg-gray-800 ${isCurrent ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}`}
                    >
                      <Icon className={`w-6 h-6 ${step.color}`} />
                    </motion.div>
                    <motion.span
                      className={`text-lg font-medium ${isCurrent ? 'text-white' : 'text-gray-300'}`}
                    >
                      {step.text}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>

            {/* Loading Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              className="h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-12 mx-auto"
              style={{ maxWidth: '300px' }}
            />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: currentStep === steps.length - 1 ? 1 : 0 }}
              transition={{ delay: 1 }}
              className="text-gray-300 mt-6 text-lg"
            >
              Your AI-powered fitness journey starts now
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
