const express = require('express');
const UsuarioController = require('../controllers/usuarioController');
const { 
  verificarAutenticacion, 
  requiereRol, 
  puedeAccederUsuario, 
  puedeModificarUsuario 
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// POST /api/usuarios - Crear nuevo usuario (solo ADMIN)
router.post('/', requiereRol('ADMIN'), UsuarioController.crear);

// GET /api/usuarios - Obtener todos los usuarios con paginación y filtros (solo ADMIN)
router.get('/', requiereRol('ADMIN'), UsuarioController.obtenerTodos);

// GET /api/usuarios/:id_usuario - Obtener usuario por ID (ADMIN o propio usuario)
router.get('/:id_usuario', puedeAccederUsuario, UsuarioController.obtenerPorId);

// PUT /api/usuarios/:id_usuario - Actualizar usuario (ADMIN o propio usuario con restricciones)
router.put('/:id_usuario', puedeModificarUsuario, UsuarioController.actualizar);

// DELETE /api/usuarios/:id_usuario - Eliminar usuario (solo ADMIN)
router.delete('/:id_usuario', requiereRol('ADMIN'), UsuarioController.eliminar);

// POST /api/usuarios/:id_usuario/cambiar-contrasena - Cambiar contraseña de usuario específico (solo ADMIN)
router.post('/:id_usuario/cambiar-contrasena', requiereRol('ADMIN'), UsuarioController.cambiarContrasenaUsuario);

module.exports = router;
