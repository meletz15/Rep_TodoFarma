const express = require('express');
const ReporteController = require('../controllers/reporteController');
const { verificarAutenticacion, requiereRol } = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación y autorización de ADMIN a todas las rutas
router.use(verificarAutenticacion);
router.use(requiereRol('ADMIN'));

// GET /api/reportes/usuarios/activos - Reporte de usuarios activos
router.get('/usuarios/activos', ReporteController.obtenerUsuariosActivos);

// GET /api/reportes/usuarios/inactivos - Reporte de usuarios inactivos
router.get('/usuarios/inactivos', ReporteController.obtenerUsuariosInactivos);

// GET /api/reportes/usuarios/por-fecha - Reporte de usuarios por rango de fechas
router.get('/usuarios/por-fecha', ReporteController.obtenerUsuariosPorFecha);

// GET /api/reportes/estadisticas - Estadísticas generales
router.get('/estadisticas', ReporteController.obtenerEstadisticas);

module.exports = router;
