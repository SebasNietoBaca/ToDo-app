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

export default function TodoForm({ addTodo }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState(CATEGORIES.PERSONAL);
  const [priority, setPriority] = useState(PRIORITIES.MEDIUM);
  const [dueDate, setDueDate] = useState("");
  const inputRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    
    // SOLUCIÓN DEFINITIVA: Guardar la fecha EXACTAMENTE como viene del input
    // El input type="date" ya devuelve YYYY-MM-DD en la zona horaria local del usuario
    addTodo(trimmed, category, priority, dueDate || null);
    setText("");
    setCategory(CATEGORIES.PERSONAL);
    setPriority(PRIORITIES.MEDIUM);
    setDueDate("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      submit(e);
    }
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
            min={new Date().toISOString().split('T')[0]}
            className="form-date"
          />
        </div>
      </div>
    </form>
  );
}