// Calcular racha de días consecutivos con tareas completadas
export const calculateStreak = (todos) => {
  const completedDates = todos
    .filter(t => t.completedAt)
    .map(t => new Date(t.completedAt).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort()
    .reverse();

  let streak = 0;
  let currentDate = new Date();
  
  for (let dateStr of completedDates) {
    const date = new Date(dateStr);
    if (date.toDateString() === currentDate.toDateString() || 
        date.toDateString() === new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }
  
  return streak;
};

// Obtener tendencias de productividad
export const getProductivityTrends = (todos) => {
  const last30Days = todos.filter(todo => 
    todo.completedAt && todo.completedAt > Date.now() - 30 * 24 * 60 * 60 * 1000
  );
  
  const dailyCompletion = {};
  last30Days.forEach(todo => {
    const date = new Date(todo.completedAt).toLocaleDateString();
    dailyCompletion[date] = (dailyCompletion[date] || 0) + 1;
  });

  const completionValues = Object.values(dailyCompletion);
  const totalCompleted = completionValues.reduce((a, b) => a + b, 0);
  
  return {
    averageDaily: totalCompleted / 30,
    bestDay: Math.max(...completionValues, 0),
    consistency: (Object.keys(dailyCompletion).length / 30) * 100,
    totalLast30Days: totalCompleted
  };
};

// Calcular métricas de categorías
export const getCategoryMetrics = (todos) => {
  const categoryStats = {};
  
  todos.forEach(todo => {
    if (!categoryStats[todo.category]) {
      categoryStats[todo.category] = {
        total: 0,
        completed: 0,
        pending: 0
      };
    }
    
    categoryStats[todo.category].total++;
    if (todo.completed) {
      categoryStats[todo.category].completed++;
    } else {
      categoryStats[todo.category].pending++;
    }
  });
  
  return categoryStats;
};