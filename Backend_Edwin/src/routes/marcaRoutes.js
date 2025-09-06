const express = require('express');
const router = express.Router();
const MarcaController = require('../controllers/marcaController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarAutenticacion);

// Rutas de marcas
router.get('/', MarcaController.obtenerTodas);
router.get('/activas', MarcaController.obtenerActivas);
router.get('/:id', MarcaController.obtenerPorId);
router.post('/', MarcaController.crear);
router.put('/:id', MarcaController.actualizar);
router.delete('/:id', MarcaController.eliminar);

module.exports = router;
