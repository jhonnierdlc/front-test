const express = require('express');
const cors = require('cors');
const app = express();
const port = 5160;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let employees = [
  { id: 1, name: 'Juan Pérez', position: 'Desarrollador Frontend', salary: 50000 },
  { id: 2, name: 'María García', position: 'Desarrolladora Backend', salary: 55000 },
  { id: 3, name: 'Carlos López', position: 'DevOps Engineer', salary: 60000 },
  { id: 4, name: 'Ana Martínez', position: 'UI/UX Designer', salary: 45000 },
  { id: 5, name: 'Luis Rodríguez', position: 'Project Manager', salary: 65000 }
];

let nextId = 6;

// Routes
// GET /employees - Obtener todos los empleados
app.get('/employees', (req, res) => {
  console.log('GET /employees');
  res.json(employees);
});

// GET /employees/:id - Obtener empleado por ID
app.get('/employees/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const employee = employees.find(emp => emp.id === id);
  
  if (employee) {
    console.log(`GET /employees/${id}`, employee);
    res.json(employee);
  } else {
    res.status(404).json({ error: 'Empleado no encontrado' });
  }
});

// POST /employees - Crear nuevo empleado
app.post('/employees', (req, res) => {
  const { name, position, salary } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  
  const newEmployee = {
    id: nextId++,
    name,
    position: position || '',
    salary: salary || 0
  };
  
  employees.push(newEmployee);
  console.log('POST /employees', newEmployee);
  res.status(201).json(newEmployee);
});

// PUT /employees/:id - Actualizar empleado
app.put('/employees/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, position, salary } = req.body;
  
  const employeeIndex = employees.findIndex(emp => emp.id === id);
  
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }
  
  if (!name) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  
  employees[employeeIndex] = {
    id,
    name,
    position: position || '',
    salary: salary || 0
  };
  
  console.log(`PUT /employees/${id}`, employees[employeeIndex]);
  res.json(employees[employeeIndex]);
});

// DELETE /employees/:id - Eliminar empleado
app.delete('/employees/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const employeeIndex = employees.findIndex(emp => emp.id === id);
  
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }
  
  const deletedEmployee = employees.splice(employeeIndex, 1)[0];
  console.log(`DELETE /employees/${id}`, deletedEmployee);
  res.json({ message: 'Empleado eliminado correctamente', employee: deletedEmployee });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Mock API Server running at http://localhost:${port}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET    /employees     - Listar empleados`);
  console.log(`   GET    /employees/:id - Obtener empleado`);
  console.log(`   POST   /employees     - Crear empleado`);
  console.log(`   PUT    /employees/:id - Actualizar empleado`);
  console.log(`   DELETE /employees/:id - Eliminar empleado`);
  console.log(`\n💡 Datos iniciales: ${employees.length} empleados`);
});

module.exports = app;