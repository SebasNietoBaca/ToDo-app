import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onAddTodo = () => {},
  onToggleTheme = () => {},
  onClearCompleted = () => {},
  onFocusSearch = () => {},
  onShowStats = () => {}
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + N: Nueva tarea
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const todoInput = document.getElementById('todo-input');
        if (todoInput) {
          todoInput.focus();
        }
        onAddTodo();
      }
      
      // Ctrl/Cmd + K: Buscar
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        onFocusSearch();
      }
      
      // Ctrl/Cmd + D: Toggle tema
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        onToggleTheme();
      }
      
      // Ctrl/Cmd + Shift + C: Limpiar completadas
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        onClearCompleted();
      }

      // Ctrl/Cmd + S: Mostrar estadísticas
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onShowStats();
      }
      
      // Escape: Limpiar búsqueda
      if (e.key === 'Escape') {
        const searchInput = document.getElementById('search');
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
        }
        
        const todoInput = document.getElementById('todo-input');
        if (todoInput && document.activeElement === todoInput) {
          todoInput.blur();
        }
      }

      // Enter en búsqueda para crear nueva tarea
      if (e.key === 'Enter' && e.ctrlKey) {
        const searchInput = document.getElementById('search');
        if (searchInput && document.activeElement === searchInput && searchInput.value.trim()) {
          e.preventDefault();
          const todoInput = document.getElementById('todo-input');
          if (todoInput) {
            todoInput.value = searchInput.value;
            todoInput.focus();
            searchInput.value = '';
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onAddTodo, onToggleTheme, onClearCompleted, onFocusSearch, onShowStats]);
}