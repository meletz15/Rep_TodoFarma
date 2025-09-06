const express = require('express');
const ClienteController = require('../controllers/clienteController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// POST /api/clientes - Crear nuevo cliente
router.post('/', requiereRol('ADMIN'), ClienteController.crear);

// GET /api/clientes - Obtener todos los clientes con paginación y filtros
router.get('/', ClienteController.obtenerTodos);

// GET /api/clientes/estadisticas - Obtener estadísticas de clientes
router.get('/estadisticas', ClienteController.obtenerEstadisticas);

// GET /api/clientes/rango-fechas - Obtener clientes por rango de fechas
router.get('/rango-fechas', ClienteController.obtenerPorRangoFechas);

// GET /api/clientes/:id_cliente - Obtener cliente por ID
router.get('/:id_cliente', ClienteController.obtenerPorId);

// PUT /api/clientes/:id_cliente - Actualizar cliente
router.put('/:id_cliente', requiereRol('ADMIN'), ClienteController.actualizar);

// DELETE /api/clientes/:id_cliente - Eliminar cliente
router.delete('/:id_cliente', requiereRol('ADMIN'), ClienteController.eliminar);

module.exports = router;
