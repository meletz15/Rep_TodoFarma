const express = require('express');
const CajaController = require('../controllers/cajaController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// POST /api/caja/abrir - Abrir caja
router.post('/abrir', requiereRol('ADMIN'), CajaController.abrirCaja);

// PUT /api/caja/:id_caja/cerrar - Cerrar caja
router.put('/:id_caja/cerrar', requiereRol('ADMIN'), CajaController.cerrarCaja);

// GET /api/caja/abierta - Obtener caja abierta
router.get('/abierta', CajaController.obtenerCajaAbierta);

// GET /api/caja - Obtener todas las cajas con paginación y filtros
router.get('/', CajaController.obtenerCajas);

// GET /api/caja/verificar - Verificar si hay caja abierta
router.get('/verificar', CajaController.verificarCajaAbierta);

// GET /api/caja/resumen-dia - Obtener resumen de caja por día
router.get('/resumen-dia', CajaController.obtenerResumenPorDia);

// GET /api/caja/estadisticas - Obtener estadísticas de caja
router.get('/estadisticas', CajaController.obtenerEstadisticas);

// GET /api/caja/:id_caja - Obtener caja por ID
router.get('/:id_caja', CajaController.obtenerPorId);

module.exports = router;
