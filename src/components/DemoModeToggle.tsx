import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useDemoMode } from '../utils/demoData';

const DemoModeToggle: React.FC = () => {
  const { isDemoMode, enableDemo, disableDemo } = useDemoMode();

  const handleToggle = () => {
    if (isDemoMode) {
      disableDemo();
      window.location.reload(); // Refresh to show real data
    } else {
      enableDemo();
      window.location.reload(); // Refresh to show demo data
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      className={`fixed bottom-4 right-4 z-40 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
        isDemoMode
          ? 'bg-green-500 text-white hover:bg-green-600'
          : 'bg-gray-600 text-gray-200 hover:bg-gray-700'
      }`}
      title={isDemoMode ? 'Disable Demo Mode' : 'Enable Demo Mode'}
    >
      <div className="flex items-center space-x-2">
        {isDemoMode ? (
          <>
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Demo ON</span>
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            <span className="text-sm font-medium">Demo OFF</span>
          </>
        )}
      </div>
    </motion.button>
  );
};

export default DemoModeToggle;
