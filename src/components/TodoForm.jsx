import React, { useRef, useState } from "react";

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

// Función para obtener la fecha actual en formato YYYY-MM-DD en hora local
const getCurrentLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  
  // Crear fecha en hora local - esta es la clave
  const localDate = new Date(year, month - 1, day, hour24, minute, 0, 0);
  return localDate.toISOString();
};

export default function TodoForm({ addTodo }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState(CATEGORIES.PERSONAL);
  const [priority, setPriority] = useState(PRIORITIES.MEDIUM);
  const [dueDate, setDueDate] = useState("");
  
  // Estado para horas en formato 12h
  const [dueTime, setDueTime] = useState({
    hour: 11,
    minute: 59,
    period: 'PM'
  });
  
  const inputRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    
    // SOLUCIÓN SIMPLIFICADA: Crear la fecha directamente
    let dueDateTime = null;
    if (dueDate) {
      dueDateTime = createLocalDate(dueDate, dueTime.hour, dueTime.minute, dueTime.period);
    }
    
    addTodo(trimmed, category, priority, dueDateTime);
    setText("");
    setCategory(CATEGORIES.PERSONAL);
    setPriority(PRIORITIES.MEDIUM);
    setDueDate("");
    setDueTime({ hour: 11, minute: 59, period: 'PM' });
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      submit(e);
    }
  };

  // Generar opciones para horas (1-12) y minutos (0-59)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Función para formatear la visualización de fecha/hora
  const formatDisplayDateTime = (dateStr, timeObj) => {
    if (!dateStr) return '';
    
    const [year, month, day] = dateStr.split('-').map(Number);
    const displayDate = new Date(year, month - 1, day, 
      timeObj.period === 'PM' && timeObj.hour !== 12 ? timeObj.hour + 12 : 
      timeObj.period === 'AM' && timeObj.hour === 12 ? 0 : timeObj.hour, 
      timeObj.minute);
    
    return displayDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <form className="todo-form" onSubmit={submit} aria-label="Formulario para nueva tarea">
      <div className="form-main-row">
        <div className="input-wrapper">
          <label htmlFor="todo-input" className="sr-only">Nueva tarea</label>
          <input
            id="todo-input"
            ref={inputRef}
            type="text"
            placeholder="¿Qué necesitas hacer?..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            aria-label="Texto de la nueva tarea"
          />
        </div>
        <button type="submit" className="submit-btn" aria-label="Agregar tarea">
          ➕ Agregar
        </button>
      </div>

      <div className="form-options-row">
        <div className="form-group">
          <label htmlFor="todo-category" className="form-label">
            📁 Categoría
          </label>
          <select 
            id="todo-category"
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
          >
            <option value={CATEGORIES.PERSONAL}>👤 Personal</option>
            <option value={CATEGORIES.WORK}>💼 Trabajo</option>
            <option value={CATEGORIES.STUDY}>📚 Estudio</option>
            <option value={CATEGORIES.HEALTH}>🏥 Salud</option>
            <option value={CATEGORIES.SHOPPING}>🛒 Compras</option>
            <option value={CATEGORIES.OTHER}>📌 Otros</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="todo-priority" className="form-label">
            🎯 Prioridad
          </label>
          <select 
            id="todo-priority"
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
            className="form-select"
          >
            <option value={PRIORITIES.LOW}>📋 Baja</option>
            <option value={PRIORITIES.MEDIUM}>⚡ Media</option>
            <option value={PRIORITIES.HIGH}>🔥 Alta</option>
            <option value={PRIORITIES.URGENT}>🚀 Urgente</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="todo-due-date" className="form-label">
            📅 Fecha límite
          </label>
          <input
            id="todo-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={getCurrentLocalDate()}
            className="form-date"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            🕒 Hora límite
          </label>
          <div className="time-selectors">
            <select
              value={dueTime.hour}
              onChange={(e) => setDueTime({...dueTime, hour: parseInt(e.target.value)})}
              className="form-time-select"
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <span>:</span>
            <select
              value={dueTime.minute}
              onChange={(e) => setDueTime({...dueTime, minute: parseInt(e.target.value)})}
              className="form-time-select"
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
              className="form-period-select"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      {dueDate && (
        <div className="datetime-preview">
          <small>
            ⏰ Vence: {formatDisplayDateTime(dueDate, dueTime)}
          </small>
        </div>
      )}
    </form>
  );
}