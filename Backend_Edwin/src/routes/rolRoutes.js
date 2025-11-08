const express = require('express');
const RolController = require('../controllers/rolController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Solo ADMIN puede gestionar roles
router.get('/', requiereRol('ADMIN'), RolController.obtenerTodos);
router.get('/:id', requiereRol('ADMIN'), RolController.obtenerPorId);
router.post('/', requiereRol('ADMIN'), RolController.crear);
router.put('/:id', requiereRol('ADMIN'), RolController.actualizar);
router.delete('/:id', requiereRol('ADMIN'), RolController.eliminar);

module.exports = router;

