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
    const icons = {
      [CATEGORIES.PERSONAL]: "👤",
      [CATEGORIES.WORK]: "💼",
      [CATEGORIES.STUDY]: "📚",
      [CATEGORIES.HEALTH]: "🏥", 
      [CATEGORIES.SHOPPING]: "🛒",
      [CATEGORIES.OTHER]: "📌"
    };
    return icons[category] || "📌";
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      [PRIORITIES.URGENT]: "🚀",
      [PRIORITIES.HIGH]: "🔥",
      [PRIORITIES.MEDIUM]: "⚡",
      [PRIORITIES.LOW]: "📋"
    };
    return icons[priority] || "📋";
  };

  const formatDueDate = (dueDateString) => {
    if (!dueDateString) return null;
    
    try {
      const [year, month, day] = dueDateString.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      
      const today = new Date();
      const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const tomorrow = new Date(todayLocal);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (dueDate.getTime() === todayLocal.getTime()) {
        return "Hoy";
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        return "Mañana";
      } else {
        const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        return `${day} ${monthNames[month - 1]}`;
      }
    } catch (error) {
      return dueDateString;
    }
  };

  const isOverdue = todo.dueDate && !todo.completed && (() => {
    try {
      const [year, month, day] = todo.dueDate.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      
      const today = new Date();
      const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      return dueDate < todayLocal;
    } catch (error) {
      return false;
    }
  })();

  const getDaysUntilDue = () => {
    if (!todo.dueDate) return null;
    
    try {
      const [year, month, day] = todo.dueDate.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      
      const today = new Date();
      const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const diffTime = dueDate.getTime() - todayLocal.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      return null;
    }
  };

  const daysUntilDue = getDaysUntilDue();

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
                <span className={`due-date-badge ${isOverdue ? "overdue" : ""} ${daysUntilDue !== null && daysUntilDue <= 3 ? "soon" : ""}`}>
                  📅 {formatDueDate(todo.dueDate)}
                  {isOverdue && " ⚠️"}
                  {daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue > 0 && ` (${daysUntilDue}d)`}
                </span>
              )}
              <span className="created-date">
                📅 {new Date(todo.createdAt).toLocaleDateString()}
              </span>
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