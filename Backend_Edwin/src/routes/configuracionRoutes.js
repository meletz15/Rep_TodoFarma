const express = require('express');
const router = express.Router();
const ConfiguracionController = require('../controllers/configuracionController');
const { verificarAutenticacion, requiereRol } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// GET /api/configuracion - Obtener configuración del sistema
router.get('/', requiereRol('ADMIN'), ConfiguracionController.obtener);

// PUT /api/configuracion/formato - Actualizar formato del sistema
router.put('/formato', requiereRol('ADMIN'), ConfiguracionController.actualizarFormato);

// PUT /api/configuracion/facturacion - Actualizar datos de facturación
router.put('/facturacion', requiereRol('ADMIN'), ConfiguracionController.actualizarFacturacion);

// PUT /api/configuracion/direccion - Actualizar dirección de la empresa
router.put('/direccion', requiereRol('ADMIN'), ConfiguracionController.actualizarDireccion);

// PUT /api/configuracion/telefonos - Actualizar teléfonos de la empresa
router.put('/telefonos', requiereRol('ADMIN'), ConfiguracionController.actualizarTelefonos);

module.exports = router;
