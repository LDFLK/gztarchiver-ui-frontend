import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        className="p-2 dark:text-gray-400 text-cyan-400 dark:hover:text-cyan-400 hover:text-gray-500 hover:cursor-pointer rounded-lg dark:hover:bg-gray-800/50 hover:bg-gray-100 transition-all duration-200"
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
      {/* Tooltip - appears below icon */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        Switch to {isDark ? 'light' : 'dark'} mode
        {/* Tooltip arrow pointing to icon */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 translate-y-0">
          <div className="border-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;

