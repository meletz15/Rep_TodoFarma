const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rate limiting para login (5 intentos por 15 minutos)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: {
    ok: false,
    mensaje: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', loginLimiter, AuthController.login);

// GET /api/auth/perfil - Obtener perfil del usuario autenticado
router.get('/perfil', verificarAutenticacion, AuthController.obtenerPerfil);

// POST /api/auth/cambiar-contrasena - Cambiar contraseña del usuario autenticado
router.post('/cambiar-contrasena', verificarAutenticacion, AuthController.cambiarContrasena);

module.exports = router;
