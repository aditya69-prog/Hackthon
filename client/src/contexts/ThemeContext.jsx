import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const themes = [
  { id: 'light', name: 'Light', color: '#fcfcfc' },
  { id: 'dark', name: 'Dark', color: '#0f0f0f' },
  { id: 'matcha', name: 'Matcha', color: '#f4f6f0' },
  { id: 'oat', name: 'Oat', color: '#faf8f5' },
  { id: 'rose', name: 'Rose', color: '#fcf8f8' },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('rnsconnect_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rnsconnect_theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => setTheme(newTheme);

  return (
    <ThemeContext.Provider value={{ theme, themes, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
