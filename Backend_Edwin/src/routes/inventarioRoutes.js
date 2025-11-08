const express = require('express');
const InventarioController = require('../controllers/inventarioController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// GET /api/inventario/movimientos - Obtener movimientos de inventario con paginación y filtros
router.get('/movimientos', InventarioController.obtenerMovimientos);

// GET /api/inventario/producto/:id_producto/kardex - Obtener kardex de un producto específico
router.get('/producto/:id_producto/kardex', InventarioController.obtenerKardexProducto);

// POST /api/inventario/movimiento - Crear movimiento de inventario manual
router.post('/movimiento', requiereRol('ADMIN'), InventarioController.crearMovimiento);

// POST /api/inventario/conversion - Crear conversión de producto (ej: blister a pastillas sueltas)
router.post('/conversion', requiereRol('ADMIN'), InventarioController.crearConversion);

// GET /api/inventario/estadisticas - Obtener estadísticas de inventario
router.get('/estadisticas', InventarioController.obtenerEstadisticas);

// GET /api/inventario/stock-bajo - Obtener productos con stock bajo
router.get('/stock-bajo', InventarioController.obtenerProductosStockBajo);

// GET /api/inventario/por-vencer - Obtener productos próximos a vencer
router.get('/por-vencer', InventarioController.obtenerProductosPorVencer);

// GET /api/inventario/resumen-categoria - Obtener resumen de inventario por categoría
router.get('/resumen-categoria', InventarioController.obtenerResumenPorCategoria);

router.get('/producto/:id_producto/lotes', InventarioController.obtenerLotesProducto);

module.exports = router;
