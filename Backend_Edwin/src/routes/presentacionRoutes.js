const express = require('express');
const PresentacionController = require('../controllers/presentacionController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// GET /api/presentacion - Obtener todas las presentaciones con paginación y filtros
router.get('/', PresentacionController.obtenerTodas);

// GET /api/presentacion/activas - Obtener presentaciones activas (para dropdowns)
router.get('/activas', PresentacionController.obtenerActivas);

// GET /api/presentacion/:id - Obtener presentación por ID
router.get('/:id', PresentacionController.obtenerPorId);

// POST /api/presentacion - Crear nueva presentación (solo ADMIN)
router.post('/', requiereRol('ADMIN'), PresentacionController.crear);

// PUT /api/presentacion/:id - Actualizar presentación (solo ADMIN)
router.put('/:id', requiereRol('ADMIN'), PresentacionController.actualizar);

// DELETE /api/presentacion/:id - Eliminar presentación (solo ADMIN)
router.delete('/:id', requiereRol('ADMIN'), PresentacionController.eliminar);

module.exports = router;

