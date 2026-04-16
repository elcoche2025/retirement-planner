import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const THEME_KEY = 'life-change-planner-theme';

interface ThemeCtx {
  isLight: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ isLight: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem(THEME_KEY) === 'light';
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  }, [isLight]);

  return (
    <ThemeContext.Provider value={{ isLight, toggle: () => setIsLight((v) => !v) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
