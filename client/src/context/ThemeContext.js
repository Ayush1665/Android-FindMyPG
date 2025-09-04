// src/context/ThemeContext.js
import React, {createContext, useState} from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode
      ? {
          background: '#121212',
          text: '#ffffff',
          card: '#1e1e1e',
          border: '#333333',
          tabBar: '#222222',
          textSecondary: '#bbbbbb',
        }
      : {
          background: '#e0e0e0',
          text: '#2c2c2c',
          secondaryText: '#5e5e5e',
          textSecondary: '#5e5e5e',
          card: '#f0f0f0',
          border: '#cccccc',
          tabBar: '#d6d6d6',
          icon: '#3c3c3c',
          placeholder: '#9e9e9e',
        },
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
