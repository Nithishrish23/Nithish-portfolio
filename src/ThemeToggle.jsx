import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('portfolio-theme') || 'system');
  const [systemTheme, setSystemTheme] = useState(() => window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const resolved = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: light)');
      const onChange = (event) => setSystemTheme(event.matches ? 'light' : 'dark');
      media.addEventListener?.('change', onChange);
      return () => media.removeEventListener?.('change', onChange);
    }
    localStorage.setItem('portfolio-theme', theme);
    return undefined;
  }, [theme, resolved]);

  const toggle = () => {
    const next = resolved === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('portfolio-theme', next);
  };

  return <button className="theme-toggle" onClick={toggle} aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} theme`}>
    {resolved === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
  </button>;
}
