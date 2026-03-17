import { useState, useEffect } from 'react';
import { loadData, saveData } from '../utils/dataStore';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return loadData('THEME') || 'dark';
  });

  useEffect(() => {
    saveData('THEME', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return { theme, toggleTheme };
}
