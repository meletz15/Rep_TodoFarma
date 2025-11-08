const express = require('express');
const UnidadMedidaController = require('../controllers/unidadMedidaController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// GET /api/unidad-medida - Obtener todas las unidades de medida con paginación y filtros
router.get('/', UnidadMedidaController.obtenerTodas);

// GET /api/unidad-medida/activas - Obtener unidades de medida activas (para dropdowns)
router.get('/activas', UnidadMedidaController.obtenerActivas);

// GET /api/unidad-medida/:id - Obtener unidad de medida por ID
router.get('/:id', UnidadMedidaController.obtenerPorId);

// POST /api/unidad-medida - Crear nueva unidad de medida (solo ADMIN)
router.post('/', requiereRol('ADMIN'), UnidadMedidaController.crear);

// PUT /api/unidad-medida/:id - Actualizar unidad de medida (solo ADMIN)
router.put('/:id', requiereRol('ADMIN'), UnidadMedidaController.actualizar);

// DELETE /api/unidad-medida/:id - Eliminar unidad de medida (solo ADMIN)
router.delete('/:id', requiereRol('ADMIN'), UnidadMedidaController.eliminar);

module.exports = router;

