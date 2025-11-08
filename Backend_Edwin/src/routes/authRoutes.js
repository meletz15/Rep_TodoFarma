const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rate limiting para login (10 intentos por 15 minutos)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos (aumentado de 5 a 10)
  message: {
    ok: false,
    mensaje: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar intentos exitosos
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', loginLimiter, AuthController.login);

// GET /api/auth/perfil - Obtener perfil del usuario autenticado
router.get('/perfil', verificarAutenticacion, AuthController.obtenerPerfil);

// POST /api/auth/cambiar-contrasena - Cambiar contraseña del usuario autenticado
router.post('/cambiar-contrasena', verificarAutenticacion, AuthController.cambiarContrasena);

module.exports = router;
