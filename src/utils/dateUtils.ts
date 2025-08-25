import { format, isToday, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  return format(dateObj, 'MMM dd');
};

export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

export const getCurrentWeek = (): Date[] => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(now, { weekStartsOn: 0 });
  
  return eachDayOfInterval({ start, end });
};

export const getWeekDates = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  
  return eachDayOfInterval({ start, end });
};

export const isDateCompleted = (date: Date, completedDates: string[]): boolean => {
  return completedDates.some(completedDate => 
    isSameDay(new Date(completedDate), date)
  );
};

export const getDayOfWeek = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

export const getCalendarMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Get the first Sunday before or on the first day of the month
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  
  // Get the last Saturday after or on the last day of the month
  const endDate = new Date(lastDay);
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
  
  return eachDayOfInterval({ start: startDate, end: endDate });
};

export const getStreakText = (streak: number): string => {
  if (streak === 0) {
    return 'Start your streak!';
  }
  
  if (streak === 1) {
    return '1 day streak!';
  }
  
  return `${streak} day streak!`;
};

export const getWeeklyProgressText = (completed: number, goal: number): string => {
  if (completed === 0) {
    return `0/${goal} workouts this week`;
  }
  
  if (completed === goal) {
    return `🎉 Weekly goal complete! ${completed}/${goal}`;
  }
  
  if (completed > goal) {
    return `🔥 Exceeded goal! ${completed}/${goal}`;
  }
  
  return `${completed}/${goal} workouts this week`;
};