const express = require('express');
const CategoriaController = require('../controllers/categoriaController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// POST /api/categorias - Crear nueva categoría
router.post('/', requiereRol('ADMIN'), CategoriaController.crear);

// GET /api/categorias - Obtener todas las categorías con paginación y filtros
router.get('/', CategoriaController.obtenerTodas);

// GET /api/categorias/activas - Obtener categorías activas (para dropdowns)
router.get('/activas', CategoriaController.obtenerActivas);

// GET /api/categorias/estadisticas - Obtener estadísticas de categorías
router.get('/estadisticas', CategoriaController.obtenerEstadisticas);

// GET /api/categorias/:id_categoria - Obtener categoría por ID
router.get('/:id_categoria', CategoriaController.obtenerPorId);

// PUT /api/categorias/:id_categoria - Actualizar categoría
router.put('/:id_categoria', requiereRol('ADMIN'), CategoriaController.actualizar);

// DELETE /api/categorias/:id_categoria - Eliminar categoría
router.delete('/:id_categoria', requiereRol('ADMIN'), CategoriaController.eliminar);

module.exports = router;
