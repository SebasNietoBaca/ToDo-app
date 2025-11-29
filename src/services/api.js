const API_URL = 'http://localhost:3001';

// Simular delay para desarrollo
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const todoAPI = {
  // Obtener todas las tareas
  async getTodos() {
    try {
      await simulateDelay(200);
      const response = await fetch(`${API_URL}/todos`);
      if (!response.ok) throw new Error('Error fetching todos');
      const data = await response.json();
      console.log('✅ Tareas cargadas del servidor:', data.length);
      return data;
    } catch (error) {
      console.error('❌ API Error - getTodos:', error);
      throw error;
    }
  },

  // Crear nueva tarea
  async createTodo(todo) {
    try {
      await simulateDelay(300);
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });
      if (!response.ok) throw new Error('Error creating todo');
      const data = await response.json();
      console.log('✅ Tarea creada en servidor:', data.id);
      return data;
    } catch (error) {
      console.error('❌ API Error - createTodo:', error);
      throw error;
    }
  },

  // Actualizar tarea
  async updateTodo(id, updates) {
    try {
      await simulateDelay(300);
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Error updating todo');
      const data = await response.json();
      console.log('✅ Tarea actualizada en servidor:', id);
      return data;
    } catch (error) {
      console.error('❌ API Error - updateTodo:', error);
      throw error;
    }
  },

  // Eliminar tarea
  async deleteTodo(id) {
    try {
      await simulateDelay(200);
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error deleting todo');
      console.log('✅ Tarea eliminada del servidor:', id);
      return true;
    } catch (error) {
      console.error('❌ API Error - deleteTodo:', error);
      throw error;
    }
  },

  // Sincronizar todas las tareas (reemplaza todo en el servidor)
  async syncTodos(todos) {
    try {
      console.log('🔄 Sincronizando', todos.length, 'tareas con el servidor...');
      await simulateDelay(1000);
      
      // Primero obtenemos las tareas existentes
      const existingTodos = await this.getTodos();
      
      // Eliminamos todas las tareas existentes
      for (const todo of existingTodos) {
        await this.deleteTodo(todo.id);
      }
      
      // Creamos las nuevas tareas
      for (const todo of todos) {
        await this.createTodo(todo);
      }
      
      console.log('✅ Sincronización completada');
      return true;
    } catch (error) {
      console.error('❌ API Error - syncTodos:', error);
      throw error;
    }
  },

  // Verificar conexión con el servidor
  async checkConnection() {
    try {
      const response = await fetch(`${API_URL}/todos`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Obtener estadísticas del servidor
  async getStats() {
    try {
      const todos = await this.getTodos();
      
      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      const pending = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Tareas vencidas
      const today = new Date();
      const overdue = todos.filter(todo => {
        if (!todo.dueDate || todo.completed) return false;
        try {
          const dueDate = new Date(todo.dueDate);
          return dueDate < today;
        } catch (error) {
          return false;
        }
      }).length;

      // Tareas próximas (próximos 7 días)
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const upcoming = todos.filter(todo => {
        if (!todo.dueDate || todo.completed) return false;
        try {
          const dueDate = new Date(todo.dueDate);
          return dueDate >= today && dueDate <= nextWeek;
        } catch (error) {
          return false;
        }
      }).length;

      return {
        total,
        completed,
        pending,
        completionRate,
        overdue,
        upcoming
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
};