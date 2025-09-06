const express = require('express');
const ProveedorController = require('../controllers/proveedorController');
const { 
  verificarAutenticacion, 
  requiereRol 
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// POST /api/proveedores - Crear nuevo proveedor (solo ADMINISTRADOR)
router.post('/', requiereRol('ADMIN'), ProveedorController.crear);

// GET /api/proveedores - Obtener todos los proveedores con paginación y filtros (solo ADMINISTRADOR)
router.get('/', requiereRol('ADMIN'), ProveedorController.obtenerTodos);

// GET /api/proveedores/:id - Obtener proveedor por ID (solo ADMINISTRADOR)
router.get('/:id', requiereRol('ADMIN'), ProveedorController.obtenerPorId);

// PUT /api/proveedores/:id - Actualizar proveedor (solo ADMINISTRADOR)
router.put('/:id', requiereRol('ADMIN'), ProveedorController.actualizar);

// DELETE /api/proveedores/:id - Eliminar proveedor (solo ADMINISTRADOR)
router.delete('/:id', requiereRol('ADMIN'), ProveedorController.eliminar);

module.exports = router;
