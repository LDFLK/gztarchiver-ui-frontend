/**
 * Theme color mappings for dark/light mode
 * Maps current dark theme colors to light theme equivalents
 */

export const themeColors = {
  // Background colors
  backgrounds: {
    'bg-gray-950': { dark: 'bg-gray-950', light: 'bg-gray-50' },
    'bg-gray-900': { dark: 'bg-gray-900', light: 'bg-gray-100' },
    'bg-gray-800': { dark: 'bg-gray-800', light: 'bg-gray-200' },
    'bg-gray-700': { dark: 'bg-gray-700', light: 'bg-gray-300' },
    'bg-black': { dark: 'bg-black', light: 'bg-white' },
  },
  
  // Background with opacity
  backgroundOpacity: {
    'bg-gray-950/95': { dark: 'bg-gray-950/95', light: 'bg-white/95' },
    'bg-gray-950/80': { dark: 'bg-gray-950/80', light: 'bg-white/80' },
    'bg-gray-900/90': { dark: 'bg-gray-900/90', light: 'bg-gray-100/90' },
    'bg-gray-900/80': { dark: 'bg-gray-900/80', light: 'bg-gray-100/80' },
    'bg-gray-800/50': { dark: 'bg-gray-800/50', light: 'bg-gray-200/50' },
    'bg-black/30': { dark: 'bg-black/30', light: 'bg-white/30' },
  },

  // Text colors
  text: {
    'text-white': { dark: 'text-white', light: 'text-gray-900' },
    'text-gray-300': { dark: 'text-gray-300', light: 'text-gray-700' },
    'text-gray-400': { dark: 'text-gray-400', light: 'text-gray-600' },
    'text-gray-500': { dark: 'text-gray-500', light: 'text-gray-500' },
    'text-gray-600': { dark: 'text-gray-600', light: 'text-gray-400' },
    'text-gray-800': { dark: 'text-gray-800', light: 'text-gray-200' },
  },

  // Border colors
  borders: {
    'border-gray-800': { dark: 'border-gray-800', light: 'border-gray-300' },
    'border-gray-700': { dark: 'border-gray-700', light: 'border-gray-300' },
    'border-gray-600': { dark: 'border-gray-600', light: 'border-gray-400' },
    'border-gray-500': { dark: 'border-gray-500', light: 'border-gray-400' },
  },

  // Border with opacity
  borderOpacity: {
    'border-gray-800/50': { dark: 'border-gray-800/50', light: 'border-gray-300/50' },
    'border-gray-700': { dark: 'border-gray-700', light: 'border-gray-300' },
  },

  // Gradient colors (from/to)
  gradients: {
    'from-gray-800': { dark: 'from-gray-800', light: 'from-gray-200' },
    'to-gray-900': { dark: 'to-gray-900', light: 'to-gray-100' },
    'from-gray-700': { dark: 'from-gray-700', light: 'from-gray-300' },
    'to-gray-800': { dark: 'to-gray-800', light: 'to-gray-200' },
  },
};

/**
 * Helper function to convert a single color class to theme-aware classes
 * @param {string} colorClass - The color class to convert (e.g., 'bg-gray-950')
 * @returns {string} Theme-aware classes (e.g., 'dark:bg-gray-950 bg-gray-50')
 */
export const getThemeClass = (colorClass) => {
  // Check all mappings
  for (const category of Object.values(themeColors)) {
    if (category[colorClass]) {
      return `${category[colorClass].dark} ${category[colorClass].light}`;
    }
  }
  
  // Return original if no mapping found
  return colorClass;
};

