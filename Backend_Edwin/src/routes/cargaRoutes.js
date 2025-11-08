const express = require('express');
const CargaController = require('../controllers/cargaController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// GET /api/carga/plantilla/:tipo - Descargar plantilla Excel
router.get('/plantilla/:tipo', CargaController.generarPlantilla);

// POST /api/carga/procesar - Procesar archivo Excel y devolver preview
router.post('/procesar', requiereRol('ADMIN'), CargaController.subirArchivo, CargaController.procesarExcel);

// POST /api/carga/confirmar - Confirmar y cargar datos al sistema
router.post('/confirmar', requiereRol('ADMIN'), CargaController.confirmarCarga);

module.exports = router;

