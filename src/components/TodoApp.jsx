import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";
import StatsPanel from "./StatsPanel";
import AchievementsPanel from "./AchievementsPanel";
import ThemeSelector from "./ThemeSelector";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { todoAPI } from "../services/api";
import { exportToJSON, importFromJSON } from "../utils/exportUtils";
import { calculateStreak, getProductivityTrends } from "../utils/analytics";

const SORT = {
  NEWEST: "newest",
  OLDEST: "oldest", 
  ALPHA: "alpha",
  COMPLETED_AT: "completedAt",
  MANUAL: "manual"
};

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

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(SORT.NEWEST);
  const [dark, setDark] = useState(false);
  const [manualOrder, setManualOrder] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [theme, setTheme] = useState("blue");
  const [achievements, setAchievements] = useState([]);

  const searchInputRef = useRef(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar desde localStorage primero
      const raw = localStorage.getItem("todo_data_v3");
      if (raw) {
        const parsed = JSON.parse(raw);
        setTodos(parsed);
        setManualOrder(parsed.map(todo => todo.id));
      }

      // Intentar sincronizar con backend si está habilitado
      if (syncEnabled) {
        try {
          const serverTodos = await todoAPI.getTodos();
          if (serverTodos.length > 0) {
            setTodos(serverTodos);
            setManualOrder(serverTodos.map(todo => todo.id));
            setLastSync(new Date());
          }
        } catch (error) {
          console.warn('No se pudo conectar al servidor, usando localStorage');
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar con backend cuando cambien los todos
  useEffect(() => {
    if (syncEnabled && todos.length > 0) {
      syncWithBackend();
    }
  }, [todos, syncEnabled]);

  // Guardar en localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("todo_data_v3", JSON.stringify(todos));
      if (manualOrder.length > 0) {
        localStorage.setItem("todo_manual_order", JSON.stringify(manualOrder));
      }
    }
  }, [todos, manualOrder, loading]);

  // Cargar orden manual
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem("todo_manual_order");
      if (savedOrder) {
        setManualOrder(JSON.parse(savedOrder));
      }
    } catch (err) {
      console.error("Failed to load manual order", err);
    }
  }, []);

  // Tema
  useEffect(() => {
    localStorage.setItem("todo_theme_v2", dark ? "dark" : "light");
    if (dark) {
      document.documentElement.classList.add("theme-dark");
      document.documentElement.classList.remove("theme-blue", "theme-nature");
    } else {
      document.documentElement.classList.remove("theme-dark");
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [dark, theme]);

  // Calcular logros
  useEffect(() => {
    const newAchievements = calculateAchievements(todos);
    setAchievements(newAchievements);
  }, [todos]);

  const syncWithBackend = async () => {
    try {
      await todoAPI.syncTodos(todos);
      setLastSync(new Date());
    } catch (error) {
      console.error('Error syncing with backend:', error);
    }
  };

  // FUNCIONES PRINCIPALES
  const addTodo = async (text, category = CATEGORIES.PERSONAL, priority = PRIORITIES.MEDIUM, dueDate = null) => {
    const now = Date.now();
    
    const newTodo = {
      id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
      text,
      completed: false,
      createdAt: now,
      completedAt: null,
      category,
      priority,
      dueDate: dueDate
    };

    setTodos((prev) => [newTodo, ...prev]);
    setManualOrder((prev) => [newTodo.id, ...prev]);
    setSort(SORT.MANUAL);

    if (syncEnabled) {
      try {
        await todoAPI.createTodo(newTodo);
        setLastSync(new Date());
      } catch (error) {
        console.error('Error creating todo on server:', error);
      }
    }
  };

  const toggleTodo = async (id) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const now = Date.now();
        const updatedTodo = {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? now : null,
        };

        if (syncEnabled) {
          todoAPI.updateTodo(id, updatedTodo).catch(error => {
            console.error('Error updating todo on server:', error);
          });
        }

        return updatedTodo;
      })
    );
  };

  const deleteTodo = async (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setManualOrder((prev) => prev.filter(todoId => todoId !== id));

    if (syncEnabled) {
      try {
        await todoAPI.deleteTodo(id);
        setLastSync(new Date());
      } catch (error) {
        console.error('Error deleting todo on server:', error);
      }
    }
  };

  const editTodo = async (id, newText, newCategory, newPriority, newDueDate) => {
    const updatedTodo = {
      text: newText,
      category: newCategory,
      priority: newPriority,
      dueDate: newDueDate
    };

    setTodos((prev) => prev.map((t) => 
      t.id === id ? { ...t, ...updatedTodo } : t
    ));

    if (syncEnabled) {
      try {
        await todoAPI.updateTodo(id, updatedTodo);
        setLastSync(new Date());
      } catch (error) {
        console.error('Error updating todo on server:', error);
      }
    }
  };

  const clearCompleted = useCallback(async () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id);
    setTodos((prev) => prev.filter((t) => !t.completed));
    setManualOrder((prev) => prev.filter(id => !completedIds.includes(id)));

    if (syncEnabled) {
      try {
        for (const id of completedIds) {
          await todoAPI.deleteTodo(id);
        }
        setLastSync(new Date());
      } catch (error) {
        console.error('Error clearing completed on server:', error);
      }
    }
  }, [todos, syncEnabled]);

  // Funciones de exportación/importación
  const handleExport = () => {
    exportToJSON(todos);
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importedTodos = await importFromJSON(file);
      setTodos(importedTodos);
      setManualOrder(importedTodos.map(todo => todo.id));
      alert('Tareas importadas correctamente!');
    } catch (error) {
      alert('Error importando archivo: ' + error.message);
    }
    event.target.value = '';
  };

  // HOOK DE TECLADO
  useKeyboardShortcuts({
    onAddTodo: () => {
      const todoInput = document.getElementById('todo-input');
      if (todoInput) {
        todoInput.focus();
      }
    },
    onToggleTheme: () => setDark(v => !v),
    onClearCompleted: clearCompleted,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onShowStats: () => setShowStats(true)
  });

  // Drag and Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const newManualOrder = Array.from(manualOrder);
    const [movedId] = newManualOrder.splice(result.source.index, 1);
    newManualOrder.splice(result.destination.index, 0, movedId);

    setManualOrder(newManualOrder);
    setSort(SORT.MANUAL);
  };

  // Contadores y estadísticas
  const totalCount = todos.length;
  const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);
  const pendingCount = totalCount - completedCount;

  // Obtener todos en orden manual
  const getTodosInManualOrder = useMemo(() => {
    if (manualOrder.length === 0) return todos;
    
    const todoMap = new Map(todos.map(todo => [todo.id, todo]));
    return manualOrder
      .map(id => todoMap.get(id))
      .filter(todo => todo !== undefined);
  }, [todos, manualOrder]);

  // Todos visibles
  const visibleTodos = useMemo(() => {
    let list = sort === SORT.MANUAL ? getTodosInManualOrder : todos.slice();

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.text.toLowerCase().includes(q));
    }

    if (filter === "active") list = list.filter((t) => !t.completed);
    else if (filter === "completed") list = list.filter((t) => t.completed);

    if (categoryFilter !== "all") {
      list = list.filter((t) => t.category === categoryFilter);
    }

    if (priorityFilter !== "all") {
      list = list.filter((t) => t.priority === priorityFilter);
    }

    if (sort === SORT.NEWEST) {
      list.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sort === SORT.OLDEST) {
      list.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sort === SORT.ALPHA) {
      list.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sort === SORT.COMPLETED_AT) {
      list.sort((a, b) => {
        if (!a.completedAt) return 1;
        if (!b.completedAt) return -1;
        return b.completedAt - a.completedAt;
      });
    }

    return list;
  }, [todos, search, filter, sort, categoryFilter, priorityFilter, getTodosInManualOrder]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Cargando tus tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="todo-app" role="application" aria-labelledby="app-title">
        <header className="todo-header">
          <div className="header-left">
            <h1 id="app-title">🚀 TodoApp Pro</h1>
            <div className="muted" aria-live="polite">
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
              {lastSync && syncEnabled && (
                <span className="sync-status">
                  • Última sincronización: {lastSync.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="header-right">
            <div className="header-actions">
              <button 
                className="stats-btn"
                onClick={() => setShowStats(true)}
                title="Ver estadísticas (Ctrl+S)"
              >
                📊 Dashboard
              </button>
              
              <ThemeSelector theme={theme} setTheme={setTheme} />
              
              <label className="import-btn">
                📥 Importar
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImport} 
                  style={{ display: 'none' }} 
                />
              </label>

              <button onClick={handleExport} className="export-btn">
                📤 Exportar
              </button>

              <label className="sync-toggle">
                <input
                  type="checkbox"
                  checked={syncEnabled}
                  onChange={(e) => setSyncEnabled(e.target.checked)}
                />
                <span className="muted">{syncEnabled ? "🔄 Sync" : "📴 Local"}</span>
              </label>

              <label className="theme-toggle" aria-label="Alternar tema">
                <input
                  type="checkbox"
                  checked={dark}
                  onChange={() => setDark((v) => !v)}
                  aria-checked={dark}
                />
                <span className="muted">{dark ? "🌙 Dark" : "☀️ Light"}</span>
              </label>
            </div>
          </div>
        </header>

        <main>
          <TodoForm addTodo={addTodo} />

          <section className="controls" aria-label="Controles de la lista">
            <div className="filters-row">
              <div className="filters" role="tablist" aria-label="Filtros">
                <button
                  className={filter === "all" ? "active" : ""}
                  onClick={() => setFilter("all")}
                  role="tab"
                  aria-selected={filter === "all"}
                >
                  Todas
                </button>
                <button
                  className={filter === "active" ? "active" : ""}
                  onClick={() => setFilter("active")}
                  role="tab"
                  aria-selected={filter === "active"}
                >
                  Activas
                </button>
                <button
                  className={filter === "completed" ? "active" : ""}
                  onClick={() => setFilter("completed")}
                  role="tab"
                  aria-selected={filter === "completed"}
                >
                  Completadas
                </button>
              </div>

              <div className="search" role="search">
                <label htmlFor="search" className="sr-only">
                  Buscar tareas
                </label>
                <input
                  id="search"
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar tareas... (Ctrl+K)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Buscar tareas"
                />
              </div>
            </div>

            <div className="advanced-filters-row">
              <div className="advanced-filters">
                <label htmlFor="category-filter" className="filter-label">
                  Categoría:
                </label>
                <select 
                  id="category-filter"
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Todas las categorías</option>
                  <option value={CATEGORIES.PERSONAL}>👤 Personal</option>
                  <option value={CATEGORIES.WORK}>💼 Trabajo</option>
                  <option value={CATEGORIES.STUDY}>📚 Estudio</option>
                  <option value={CATEGORIES.HEALTH}>🏥 Salud</option>
                  <option value={CATEGORIES.SHOPPING}>🛒 Compras</option>
                  <option value={CATEGORIES.OTHER}>📌 Otros</option>
                </select>

                <label htmlFor="priority-filter" className="filter-label">
                  Prioridad:
                </label>
                <select 
                  id="priority-filter"
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">Todas las prioridades</option>
                  <option value={PRIORITIES.URGENT}>🚀 Urgente</option>
                  <option value={PRIORITIES.HIGH}>🔥 Alta</option>
                  <option value={PRIORITIES.MEDIUM}>⚡ Media</option>
                  <option value={PRIORITIES.LOW}>📋 Baja</option>
                </select>
              </div>

              <div className="right-actions">
                <label className="filter-label" htmlFor="sort">
                  Ordenar por:
                </label>
                <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value={SORT.NEWEST}>🕐 Más recientes</option>
                  <option value={SORT.OLDEST}>🕙 Más antiguas</option>
                  <option value={SORT.ALPHA}>🔤 A - Z</option>
                  <option value={SORT.COMPLETED_AT}>✅ Últimas completadas</option>
                  <option value={SORT.MANUAL}>👆 Manual (Arrastrable)</option>
                </select>

                <button 
                  className="clear" 
                  onClick={clearCompleted} 
                  aria-label="Borrar completadas"
                  title="Borrar completadas (Ctrl+Shift+C)"
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>
          </section>

          <section className="list-section" aria-label="Lista de tareas">
            <div className="counts">
              <div className="count-item">📊 Total: <strong>{totalCount}</strong></div>
              <div className="count-item">✅ Completadas: <strong>{completedCount}</strong></div>
              <div className="count-item">⏳ Pendientes: <strong>{pendingCount}</strong></div>
              <div className="count-item">
                {syncEnabled ? "🔄 Sincronizado" : "📴 Solo local"}
              </div>
            </div>

            {visibleTodos.length === 0 ? (
              <div className="empty">
                {search || categoryFilter !== "all" || priorityFilter !== "all" || filter !== "all" 
                  ? "No hay tareas que coincidan con los filtros" 
                  : "¡Comienza agregando tu primera tarea! 🚀"}
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="todos">
                  {(provided, snapshot) => (
                    <div
                      className={`todo-list ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {visibleTodos.map((todo, index) => (
                        <Draggable 
                          key={todo.id} 
                          draggableId={todo.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`draggable-todo ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <TodoItem
                                todo={todo}
                                toggleTodo={toggleTodo}
                                deleteTodo={deleteTodo}
                                editTodo={editTodo}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </section>
        </main>
      </div>

      {/* Panel de Estadísticas */}
      <StatsPanel 
        todos={todos} 
        isVisible={showStats} 
        onClose={() => setShowStats(false)} 
      />

      {/* Panel de Logros */}
      <AchievementsPanel achievements={achievements} />
    </div>
  );
}

// Función para calcular logros
function calculateAchievements(todos) {
  const achievements = [];
  const completedCount = todos.filter(t => t.completed).length;
  const streak = calculateStreak(todos);
  const trends = getProductivityTrends(todos);

  // Logro: Primera tarea
  if (todos.length > 0) {
    achievements.push({
      id: 'first_task',
      name: '¡Primeros pasos!',
      description: 'Creaste tu primera tarea',
      icon: '🎯',
      unlocked: true
    });
  }

  // Logro: Completar 10 tareas
  if (completedCount >= 10) {
    achievements.push({
      id: 'task_master',
      name: 'Maestro de tareas',
      description: 'Completaste 10 tareas',
      icon: '🏆',
      unlocked: true
    });
  }

  // Logro: Racha de 3 días
  if (streak >= 3) {
    achievements.push({
      id: 'productive_streak',
      name: 'Racha productiva',
      description: `${streak} días consecutivos completando tareas`,
      icon: '🔥',
      unlocked: true
    });
  }

  // Logro: Todas las categorías
  const usedCategories = [...new Set(todos.map(t => t.category))];
  if (usedCategories.length >= 4) {
    achievements.push({
      id: 'category_explorer',
      name: 'Explorador de categorías',
      description: 'Usaste 4 categorías diferentes',
      icon: '🌍',
      unlocked: true
    });
  }

  return achievements;
}