import React, { useMemo } from 'react';

const CATEGORIES = {
  PERSONAL: "personal",
  WORK: "work", 
  STUDY: "study",
  HEALTH: "health",
  SHOPPING: "shopping",
  OTHER: "other"
};

const PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium", 
  HIGH: "high",
  URGENT: "urgent"
};

// MOVER FUNCIONES AUXILIARES AL PRINCIPIO
const getCategoryColor = (category) => {
  const colors = {
    [CATEGORIES.PERSONAL]: '#3b82f6',
    [CATEGORIES.WORK]: '#8b5cf6', 
    [CATEGORIES.STUDY]: '#10b981',
    [CATEGORIES.HEALTH]: '#f59e0b',
    [CATEGORIES.SHOPPING]: '#ec4899',
    [CATEGORIES.OTHER]: '#6b7280'
  };
  return colors[category] || '#6b7280';
};

const getPriorityColor = (priority) => {
  const colors = {
    [PRIORITIES.URGENT]: '#dc2626',
    [PRIORITIES.HIGH]: '#ea580c',
    [PRIORITIES.MEDIUM]: '#d97706',
    [PRIORITIES.LOW]: '#16a34a'
  };
  return colors[priority] || '#6b7280';
};

const getCategoryIcon = (category) => {
  const icons = {
    [CATEGORIES.PERSONAL]: '👤',
    [CATEGORIES.WORK]: '💼',
    [CATEGORIES.STUDY]: '📚',
    [CATEGORIES.HEALTH]: '🏥',
    [CATEGORIES.SHOPPING]: '🛒',
    [CATEGORIES.OTHER]: '📌'
  };
  return icons[category] || '📌';
};

const getPriorityIcon = (priority) => {
  switch (priority) {
    case PRIORITIES.URGENT: return "🚀";
    case PRIORITIES.HIGH: return "🔥";
    case PRIORITIES.MEDIUM: return "⚡";
    case PRIORITIES.LOW: return "📋";
    default: return "📋";
  }
};

// SOLUCIÓN DEFINITIVA: Función que NO usa Date() para evitar problemas de zona horaria
const formatDueDate = (dueDateString) => {
  if (!dueDateString) return null;
  
  try {
    // Parsear manualmente YYYY-MM-DD
    const [year, month, day] = dueDateString.split('-').map(Number);
    
    // Crear fecha local sin problemas de zona horaria
    const dueDate = new Date(year, month - 1, day);
    
    // Hoy en fecha local
    const today = new Date();
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Mañana en fecha local
    const tomorrow = new Date(todayLocal);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Comparar timestamps de fechas locales (sin horas)
    if (dueDate.getTime() === todayLocal.getTime()) {
      return "Hoy";
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return "Mañana";
    } else {
      // Formatear manualmente para evitar problemas de zona horaria
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${day} ${monthNames[month - 1]}`;
    }
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return dueDateString;
  }
};

export default function StatsPanel({ todos, isVisible, onClose }) {
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Estadísticas por categoría
    const categoryStats = todos.reduce((acc, todo) => {
      if (!acc[todo.category]) {
        acc[todo.category] = { total: 0, completed: 0, color: getCategoryColor(todo.category) };
      }
      acc[todo.category].total++;
      if (todo.completed) acc[todo.category].completed++;
      return acc;
    }, {});

    // Estadísticas por prioridad
    const priorityStats = todos.reduce((acc, todo) => {
      if (!acc[todo.priority]) {
        acc[todo.priority] = { total: 0, completed: 0, color: getPriorityColor(todo.priority) };
      }
      acc[todo.priority].total++;
      if (todo.completed) acc[todo.priority].completed++;
      return acc;
    }, {});

    // SOLUCIÓN DEFINITIVA: Tareas próximas a vencer que NO usa Date() para comparaciones
    const today = new Date();
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextWeek = new Date(todayLocal);
    nextWeek.setDate(todayLocal.getDate() + 7);
    
    const upcoming = todos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false;
      try {
        const [year, month, day] = todo.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        return dueDate >= todayLocal && dueDate <= nextWeek;
      } catch (error) {
        return false;
      }
    }).length;

    // SOLUCIÓN DEFINITIVA: Tareas vencidas que NO usa Date() para comparaciones
    const overdue = todos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false;
      try {
        const [year, month, day] = todo.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        return dueDate < todayLocal;
      } catch (error) {
        return false;
      }
    }).length;

    // Productividad semanal (últimos 7 días)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const completedThisWeek = todos.filter(todo => 
      todo.completedAt && 
      new Date(todo.completedAt) > lastWeek
    ).length;

    return {
      total,
      completed,
      completionRate,
      categoryStats,
      priorityStats,
      upcoming,
      overdue,
      completedThisWeek,
      pending: total - completed
    };
  }, [todos]);

  if (!isVisible) return null;

  return (
    <div className="stats-panel-overlay" onClick={onClose}>
      <div className="stats-panel" onClick={(e) => e.stopPropagation()}>
        <div className="stats-header">
          <h2>📊 Dashboard de Productividad</h2>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar panel">
            ✕
          </button>
        </div>

        {/* Estadísticas principales */}
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-value">{stats.completionRate}%</div>
            <div className="stat-label">Tasa de Completación</div>
            <div className="stat-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tareas</div>
            <div className="stat-icon">📋</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completadas</div>
            <div className="stat-icon">✅</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pendientes</div>
            <div className="stat-icon">⏳</div>
          </div>
        </div>

        {/* Alertas importantes */}
        <div className="stats-alerts">
          {stats.overdue > 0 && (
            <div className="alert alert-danger">
              <span>⚠️</span>
              <div>
                <strong>{stats.overdue} tarea(s) vencida(s)</strong>
                <small>Necesitan atención inmediata</small>
              </div>
            </div>
          )}
          
          {stats.upcoming > 0 && (
            <div className="alert alert-warning">
              <span>🔔</span>
              <div>
                <strong>{stats.upcoming} tarea(s) próxima(s)</strong>
                <small>Vencen en los próximos 7 días</small>
              </div>
            </div>
          )}
          
          {stats.completedThisWeek > 0 && (
            <div className="alert alert-success">
              <span>🎉</span>
              <div>
                <strong>{stats.completedThisWeek} tarea(s) completada(s) esta semana</strong>
                <small>¡Buen trabajo!</small>
              </div>
            </div>
          )}
        </div>

        {/* Distribución por categoría */}
        <div className="stats-section">
          <h3>📁 Distribución por Categoría</h3>
          <div className="category-stats">
            {Object.entries(stats.categoryStats).map(([category, data]) => (
              <div key={category} className="category-item">
                <div className="category-header">
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <span className="category-name">{category}</span>
                  <span className="category-count">{data.total}</span>
                </div>
                <div className="category-progress">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${(data.total / stats.total) * 100}%`,
                      backgroundColor: data.color
                    }}
                  ></div>
                </div>
                <div className="category-details">
                  <span>{data.completed} completadas</span>
                  <span>{data.total - data.completed} pendientes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por prioridad */}
        <div className="stats-section">
          <h3>🎯 Distribución por Prioridad</h3>
          <div className="priority-stats">
            {Object.entries(stats.priorityStats).map(([priority, data]) => (
              <div key={priority} className="priority-item">
                <div className="priority-header">
                  <span 
                    className="priority-dot"
                    style={{ backgroundColor: getPriorityColor(priority) }}
                  ></span>
                  <span className="priority-name">{priority}</span>
                  <span className="priority-count">{data.total}</span>
                </div>
                <div className="priority-bar">
                  <div 
                    className="priority-fill"
                    style={{ 
                      width: `${(data.total / stats.total) * 100}%`,
                      backgroundColor: getPriorityColor(priority)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de productividad */}
        <div className="productivity-summary">
          <h3>📈 Resumen de Productividad</h3>
          <div className="productivity-grid">
            <div className="productivity-item">
              <div className="productivity-value">{stats.completedThisWeek}</div>
              <div className="productivity-label">Completadas esta semana</div>
            </div>
            <div className="productivity-item">
              <div className="productivity-value">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
              <div className="productivity-label">Eficiencia general</div>
            </div>
            <div className="productivity-item">
              <div className="productivity-value">{stats.upcoming}</div>
              <div className="productivity-label">Próximas esta semana</div>
            </div>
          </div>
        </div>

        <div className="stats-footer">
          <p>💡 <strong>Consejo:</strong> Usa atajos de teclado para ser más productivo</p>
          <div className="shortcuts-list">
            <span><kbd>Ctrl</kbd> + <kbd>N</kbd> Nueva tarea</span>
            <span><kbd>Ctrl</kbd> + <kbd>K</kbd> Buscar</span>
            <span><kbd>Ctrl</kbd> + <kbd>S</kbd> Estadísticas</span>
          </div>
        </div>
      </div>
    </div>
  );
}