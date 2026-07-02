import React, {createContext, useContext, useState, useEffect} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../constants/colors';
import {Fonts, FontSizes, FontWeights} from '../constants/typography';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: typeof Colors.light;
  fonts: typeof Fonts;
  fontSizes: typeof FontSizes;
  fontWeights: typeof FontWeights;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('theme_mode');
        if (saved) {
          setThemeModeState(saved as ThemeMode);
        }
      } catch (e) {
        console.error('Failed to load theme preference:', e);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem('theme_mode', mode);
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  };

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        isDark,
        colors,
        fonts: Fonts,
        fontSizes: FontSizes,
        fontWeights: FontWeights,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if not wrapped in ThemeProvider
    const systemScheme = useColorScheme();
    const isDark = systemScheme === 'dark';
    return {
      themeMode: 'system' as ThemeMode,
      setThemeMode: () => {},
      isDark,
      colors: isDark ? Colors.dark : Colors.light,
      fonts: Fonts,
      fontSizes: FontSizes,
      fontWeights: FontWeights,
    };
  }
  return context;
};
