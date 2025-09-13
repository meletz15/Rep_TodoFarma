const express = require('express');
const PedidoController = require('../controllers/pedidoController');
const { 
  verificarAutenticacion, 
  requiereRol
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// POST /api/pedidos - Crear nuevo pedido
router.post('/', requiereRol('ADMIN'), PedidoController.crear);

// GET /api/pedidos - Obtener todos los pedidos con paginación y filtros
router.get('/', PedidoController.obtenerTodos);

// GET /api/pedidos/estadisticas - Obtener estadísticas de pedidos
router.get('/estadisticas', PedidoController.obtenerEstadisticas);

// GET /api/pedidos/:id_pedido - Obtener pedido por ID
router.get('/:id_pedido', PedidoController.obtenerPorId);

// PUT /api/pedidos/:id_pedido/estado - Actualizar estado del pedido
router.put('/:id_pedido/estado', requiereRol('ADMIN'), PedidoController.actualizarEstado);

module.exports = router;
