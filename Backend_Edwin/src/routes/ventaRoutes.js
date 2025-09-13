const express = require('express');
const VentaController = require('../controllers/ventaController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// POST /api/ventas - Crear nueva venta
router.post('/', VentaController.crear);

// GET /api/ventas - Obtener todas las ventas con paginación y filtros
router.get('/', VentaController.obtenerVentas);

// GET /api/ventas/estadisticas - Obtener estadísticas de ventas
router.get('/estadisticas', VentaController.obtenerEstadisticas);

// GET /api/ventas/rango-fechas - Obtener ventas por rango de fechas
router.get('/rango-fechas', VentaController.obtenerVentasPorRangoFechas);

// GET /api/ventas/productos-mas-vendidos - Obtener productos más vendidos
router.get('/productos-mas-vendidos', VentaController.obtenerProductosMasVendidos);

// GET /api/ventas/:id_venta - Obtener venta por ID (temporalmente sin auth para debug)
router.get('/:id_venta', VentaController.obtenerPorId);

// PUT /api/ventas/:id_venta/anular - Anular venta
router.put('/:id_venta/anular', requiereRol('ADMIN'), VentaController.anularVenta);

module.exports = router;
