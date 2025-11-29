export const exportToJSON = (todos) => {
  const dataStr = JSON.stringify(todos, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `todos-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const todos = JSON.parse(e.target.result);
        // Validar que sea un array
        if (!Array.isArray(todos)) {
          throw new Error('El archivo no contiene un array de tareas');
        }
        // Validar que cada elemento tenga los campos básicos
        todos.forEach(todo => {
          if (!todo.id || !todo.text || typeof todo.completed !== 'boolean') {
            throw new Error('Formato de tarea inválido');
          }
        });
        resolve(todos);
      } catch (error) {
        reject(new Error('Archivo JSON inválido: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo'));
    reader.readAsText(file);
  });
};