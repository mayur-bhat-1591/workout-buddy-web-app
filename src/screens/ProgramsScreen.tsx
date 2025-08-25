import React from 'react';
import WorkoutPrograms from '../components/WorkoutPrograms';

interface ProgramsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

const ProgramsScreen: React.FC<ProgramsScreenProps> = ({ onNavigate }) => {
  const handleSelectProgram = (program: any) => {
    // Store selected program and navigate to workout screen
    localStorage.setItem('selectedProgram', JSON.stringify(program));
    onNavigate('workout', { program });
  };

  const handleStartWorkout = (template: any) => {
    // Store selected template and navigate to workout session
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    onNavigate('session', { template });
  };

  return (
    <WorkoutPrograms 
      onSelectProgram={handleSelectProgram}
      onStartWorkout={handleStartWorkout}
    />
  );
};

export default ProgramsScreen;
