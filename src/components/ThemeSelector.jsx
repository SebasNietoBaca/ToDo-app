import React from 'react';

const THEMES = [
  { id: 'blue', name: 'Azul', color: '#3b82f6' },
  { id: 'green', name: 'Verde', color: '#10b981' },
  { id: 'purple', name: 'Morado', color: '#8b5cf6' },
  { id: 'nature', name: 'Naturaleza', color: '#059669' }
];

export default function ThemeSelector({ theme, setTheme }) {
  return (
    <div className="theme-selector">
      <label htmlFor="theme-select" className="filter-label">
        🎨 Tema:
      </label>
      <select 
        id="theme-select"
        value={theme} 
        onChange={(e) => setTheme(e.target.value)}
        className="theme-select"
      >
        {THEMES.map(themeOption => (
          <option key={themeOption.id} value={themeOption.id}>
            {themeOption.name}
          </option>
        ))}
      </select>
    </div>
  );
}