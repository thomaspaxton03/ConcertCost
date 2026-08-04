"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const THEMES = [
  "light",
  "dark",
  "cupcake",
  "synthwave",
  "cyberpunk",
  "valentine",
  "aqua",
  "night",
  "dracula",
  "emerald",
] as const;

export type ThemeName = (typeof THEMES)[number];

const STORAGE_KEY = "concert-cost-theme";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string): value is ThemeName {
  return (THEMES as readonly string[]).includes(value);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("synthwave");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && isTheme(saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "synthwave");
    }
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}

export function ThemeSelector({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm opacity-80 whitespace-nowrap">Theme</span>
      <select
        className="select select-bordered select-sm w-full max-w-[11rem]"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeName)}
        aria-label="Choose theme"
      >
        {THEMES.map((name) => (
          <option key={name} value={name}>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
