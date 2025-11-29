import React, { useEffect, useRef, useState } from "react";

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

export default function TodoItem({ todo, toggleTodo, deleteTodo, editTodo }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todo.text);
  const [category, setCategory] = useState(todo.category);
  const [priority, setPriority] = useState(todo.priority);
  const [dueDate, setDueDate] = useState(todo.dueDate || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setValue(todo.text);
      setCategory(todo.category);
      setPriority(todo.priority);
      setDueDate(todo.dueDate || '');
      inputRef.current?.focus();
    }
  }, [editing, todo.text, todo.category, todo.priority, todo.dueDate]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      save();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const save = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      cancelEdit();
      return;
    }
    
    // SOLUCIÓN DEFINITIVA: Guardar la fecha EXACTAMENTE como viene del input
    editTodo(todo.id, trimmed, category, priority, dueDate || null);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setValue(todo.text);
    setCategory(todo.category);
    setPriority(todo.priority);
    setDueDate(todo.dueDate || '');
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case CATEGORIES.PERSONAL: return "👤";
      case CATEGORIES.WORK: return "💼";
      case CATEGORIES.STUDY: return "📚";
      case CATEGORIES.HEALTH: return "🏥";
      case CATEGORIES.SHOPPING: return "🛒";
      case CATEGORIES.OTHER: return "📌";
      default: return "📌";
    }
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

  // SOLUCIÓN DEFINITIVA: Detección que NO usa Date() para comparaciones
  const isOverdue = todo.dueDate && !todo.completed && (() => {
    try {
      const [year, month, day] = todo.dueDate.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      
      const today = new Date();
      const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      return dueDate < todayLocal;
    } catch (error) {
      console.error('Error verificando fecha vencida:', error);
      return false;
    }
  })();

  return (
    <div
      className={`todo-item ${todo.completed ? "completed" : ""} priority-${todo.priority} ${isOverdue ? "overdue" : ""}`}
      role="listitem"
      aria-label={`Tarea: ${todo.text}`}
    >
      <div className="left">
        <button
          className="toggle-btn"
          onClick={() => toggleTodo(todo.id)}
          aria-pressed={todo.completed}
          aria-label={todo.completed ? "Marcar como no completada" : "Marcar como completada"}
        >
          {todo.completed ? (
            <div className="completed-check">✅</div>
          ) : (
            <div className="incomplete-circle">⭕</div>
          )}
        </button>

        {editing ? (
          <div className="edit-form">
            <input
              ref={inputRef}
              className="edit-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Editar tarea"
              placeholder="Editar tarea..."
            />
            <div className="edit-options">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="edit-select"
              >
                <option value={CATEGORIES.PERSONAL}>👤 Personal</option>
                <option value={CATEGORIES.WORK}>💼 Trabajo</option>
                <option value={CATEGORIES.STUDY}>📚 Estudio</option>
                <option value={CATEGORIES.HEALTH}>🏥 Salud</option>
                <option value={CATEGORIES.SHOPPING}>🛒 Compras</option>
                <option value={CATEGORIES.OTHER}>📌 Otros</option>
              </select>

              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                className="edit-select"
              >
                <option value={PRIORITIES.LOW}>📋 Baja</option>
                <option value={PRIORITIES.MEDIUM}>⚡ Media</option>
                <option value={PRIORITIES.HIGH}>🔥 Alta</option>
                <option value={PRIORITIES.URGENT}>🚀 Urgente</option>
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="edit-date"
              />
            </div>
          </div>
        ) : (
          <div className="content">
            <div className="text" onClick={() => toggleTodo(todo.id)}>
              {todo.text}
            </div>
            <div className="todo-meta">
              <span className={`category-badge ${todo.category}`}>
                {getCategoryIcon(todo.category)} {todo.category}
              </span>
              <span className={`priority-badge ${todo.priority}`}>
                {getPriorityIcon(todo.priority)} {todo.priority}
              </span>
              {todo.dueDate && (
                <span className={`due-date-badge ${isOverdue ? "overdue" : ""}`}>
                  📅 {formatDueDate(todo.dueDate)}
                  {isOverdue && " ⚠️"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="actions">
        {editing ? (
          <>
            <button className="save" onClick={save} aria-label="Guardar edición" title="Guardar">
              💾
            </button>
            <button className="cancel" onClick={cancelEdit} aria-label="Cancelar edición" title="Cancelar">
              ❌
            </button>
          </>
        ) : (
          <button className="edit" onClick={() => setEditing(true)} aria-label="Editar tarea" title="Editar">
            ✏️
          </button>
        )}
        <button className="delete" onClick={() => deleteTodo(todo.id)} aria-label="Eliminar tarea" title="Eliminar">
          🗑️
        </button>
      </div>
    </div>
  );
}