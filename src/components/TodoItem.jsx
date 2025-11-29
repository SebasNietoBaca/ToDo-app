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

// Función para crear fecha local sin problemas de zona horaria
const createLocalDate = (dateString, hour, minute, period) => {
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Convertir hora 12h a 24h
  let hour24 = parseInt(hour);
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  // Crear fecha en hora local
  const localDate = new Date(year, month - 1, day, hour24, minute, 0, 0);
  return localDate.toISOString();
};

// Función para extraer componentes de fecha/hora desde ISO string
const parseISODate = (isoString) => {
  if (!isoString) return { date: '', time: { hour: 11, minute: 59, period: 'PM' } };
  
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  
  const period = hours >= 12 ? 'PM' : 'AM';
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return {
    date: `${year}-${month}-${day}`,
    time: {
      hour: hour12,
      minute: minutes,
      period: period
    }
  };
};

export default function TodoItem({ todo, toggleTodo, deleteTodo, editTodo }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todo.text);
  const [category, setCategory] = useState(todo.category);
  const [priority, setPriority] = useState(todo.priority);
  
  // Parsear fecha y hora desde el ISO string almacenado
  const parsedDateTime = parseISODate(todo.dueDate);
  const [dueDate, setDueDate] = useState(parsedDateTime.date);
  const [dueTime, setDueTime] = useState(parsedDateTime.time);
  
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setValue(todo.text);
      setCategory(todo.category);
      setPriority(todo.priority);
      
      const parsedDateTime = parseISODate(todo.dueDate);
      setDueDate(parsedDateTime.date);
      setDueTime(parsedDateTime.time);
      
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
    
    // SOLUCIÓN SIMPLIFICADA: Crear la fecha directamente
    let dueDateTime = null;
    if (dueDate) {
      dueDateTime = createLocalDate(dueDate, dueTime.hour, dueTime.minute, dueTime.period);
    }
    
    if (trimmed !== todo.text || category !== todo.category || priority !== todo.priority || dueDateTime !== todo.dueDate) {
      editTodo(todo.id, trimmed, category, priority, dueDateTime);
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setValue(todo.text);
    setCategory(todo.category);
    setPriority(todo.priority);
    
    const parsedDateTime = parseISODate(todo.dueDate);
    setDueDate(parsedDateTime.date);
    setDueTime(parsedDateTime.time);
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

  // Generar opciones para horas (1-12) y minutos (0-59)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // SOLUCIÓN: Función formatDueDate simplificada
  const formatDueDate = (dueDateString) => {
    if (!dueDateString) return null;
    
    try {
      const date = new Date(dueDateString);
      const now = new Date();
      
      // Diferencia en milisegundos
      const diffMs = date.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // Si es hoy
      if (date.toDateString() === now.toDateString()) {
        if (diffHours <= 0) {
          return `Hoy ${date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        } else if (diffHours < 1) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return `En ${diffMinutes} min`;
        } else {
          return `Hoy ${date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        }
      }
      
      // Si es mañana
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (date.toDateString() === tomorrow.toDateString()) {
        return `Mañana ${date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      }
      
      // Si es en los próximos 7 días
      if (diffDays > 0 && diffDays <= 7) {
        return `${date.toLocaleDateString('es-ES', { weekday: 'long' })} ${date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      }
      
      // Formato completo
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dueDateString;
    }
  };

  // SOLUCIÓN: Detección de fechas vencidas
  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  // Verificar si está próximo a vencer (menos de 1 hora)
  const isDueSoon = todo.dueDate && !todo.completed && !isOverdue && (() => {
    const dueDate = new Date(todo.dueDate);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return dueDate <= oneHourFromNow;
  })();

  return (
    <div
      className={`todo-item ${todo.completed ? "completed" : ""} priority-${todo.priority} ${isOverdue ? "overdue" : ""} ${isDueSoon ? "due-soon" : ""}`}
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

              <div className="datetime-edit">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="edit-date"
                />
                <div className="time-selectors">
                  <select
                    value={dueTime.hour}
                    onChange={(e) => setDueTime({...dueTime, hour: parseInt(e.target.value)})}
                    className="edit-time-select"
                  >
                    {hours.map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </select>
                  <span>:</span>
                  <select
                    value={dueTime.minute}
                    onChange={(e) => setDueTime({...dueTime, minute: parseInt(e.target.value)})}
                    className="edit-time-select"
                  >
                    {minutes.map(minute => (
                      <option key={minute} value={minute}>
                        {minute.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={dueTime.period}
                    onChange={(e) => setDueTime({...dueTime, period: e.target.value})}
                    className="edit-period-select"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
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
                <span className={`due-date-badge ${isOverdue ? "overdue" : ""} ${isDueSoon ? "due-soon" : ""}`}>
                  {isDueSoon ? "⏰" : "📅"} {formatDueDate(todo.dueDate)}
                  {isOverdue && " ⚠️"}
                  {isDueSoon && " 🔔"}
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