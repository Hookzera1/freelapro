import { useEffect } from 'react';
import { useStore } from './useStore';

export function useTheme() {
  const { theme, setTheme } = useStore();

  useEffect(() => {
    // Aplicar classe do tema no documento
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);

    // Atualizar meta tag de cor do tema
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#1a1b1e' : '#ffffff'
      );
    }

    // Sincronizar com preferência do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, setTheme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
} 