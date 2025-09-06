const express = require('express');
const ProductoController = require('../controllers/productoController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// POST /api/productos - Crear nuevo producto
router.post('/', requiereRol('ADMIN'), ProductoController.crear);

// GET /api/productos - Obtener todos los productos con paginación y filtros
router.get('/', ProductoController.obtenerTodos);

// GET /api/productos/estadisticas - Obtener estadísticas de productos
router.get('/estadisticas', ProductoController.obtenerEstadisticas);

// GET /api/productos/rango-fechas - Obtener productos por rango de fechas
router.get('/rango-fechas', ProductoController.obtenerPorRangoFechas);

// GET /api/productos/:id_producto - Obtener producto por ID
router.get('/:id_producto', ProductoController.obtenerPorId);

// PUT /api/productos/:id_producto - Actualizar producto
router.put('/:id_producto', requiereRol('ADMIN'), ProductoController.actualizar);

// DELETE /api/productos/:id_producto - Eliminar producto
router.delete('/:id_producto', requiereRol('ADMIN'), ProductoController.eliminar);

module.exports = router;
