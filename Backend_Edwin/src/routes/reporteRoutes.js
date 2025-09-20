const express = require('express');
const ReporteController = require('../controllers/reporteController');
const { verificarAutenticacion, requiereRol } = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación y autorización de ADMIN a todas las rutas
router.use(verificarAutenticacion);
router.use(requiereRol('ADMIN'));

// ========================================
// REPORTES DE USUARIOS
// ========================================

// GET /api/reportes/usuarios/activos - Reporte de usuarios activos
router.get('/usuarios/activos', ReporteController.obtenerUsuariosActivos);

// GET /api/reportes/usuarios/inactivos - Reporte de usuarios inactivos
router.get('/usuarios/inactivos', ReporteController.obtenerUsuariosInactivos);

// GET /api/reportes/usuarios/por-fecha - Reporte de usuarios por rango de fechas
router.get('/usuarios/por-fecha', ReporteController.obtenerUsuariosPorFecha);

// ========================================
// REPORTES DE VENTAS
// ========================================

// GET /api/reportes/ventas/por-periodo - Ventas por período
router.get('/ventas/por-periodo', ReporteController.obtenerVentasPorPeriodo);

// GET /api/reportes/ventas/por-usuario - Ventas por usuario/empleado
router.get('/ventas/por-usuario', ReporteController.obtenerVentasPorUsuario);

// GET /api/reportes/ventas/por-cliente - Ventas por cliente
router.get('/ventas/por-cliente', ReporteController.obtenerVentasPorCliente);

// GET /api/reportes/ventas/productos-mas-vendidos - Productos más vendidos
router.get('/ventas/productos-mas-vendidos', ReporteController.obtenerProductosMasVendidos);

// ========================================
// REPORTES DE INVENTARIO
// ========================================

// GET /api/reportes/inventario/movimientos - Movimientos de inventario
router.get('/inventario/movimientos', ReporteController.obtenerMovimientosInventario);

// GET /api/reportes/inventario/stock-actual - Stock actual
router.get('/inventario/stock-actual', ReporteController.obtenerStockActual);

// GET /api/reportes/inventario/productos-proximos-vencer - Productos próximos a vencer
router.get('/inventario/productos-proximos-vencer', ReporteController.obtenerProductosProximosAVencer);

// ========================================
// REPORTES DE CAJA
// ========================================

// GET /api/reportes/caja/resumen-diario - Resumen diario de caja
router.get('/caja/resumen-diario', ReporteController.obtenerResumenDiarioCaja);

// GET /api/reportes/caja/historico - Histórico de cajas
router.get('/caja/historico', ReporteController.obtenerHistoricoCajas);

// ========================================
// REPORTES DE PEDIDOS
// ========================================

// GET /api/reportes/pedidos/por-estado - Pedidos por estado
router.get('/pedidos/por-estado', ReporteController.obtenerPedidosPorEstado);

// GET /api/reportes/pedidos/analisis-proveedores - Análisis de proveedores
router.get('/pedidos/analisis-proveedores', ReporteController.obtenerAnalisisProveedores);

// ========================================
// REPORTES DE PRODUCTOS
// ========================================

// GET /api/reportes/productos/por-categoria - Productos por categoría
router.get('/productos/por-categoria', ReporteController.obtenerProductosPorCategoria);

// GET /api/reportes/productos/por-marca - Productos por marca
router.get('/productos/por-marca', ReporteController.obtenerProductosPorMarca);

// ========================================
// REPORTES DE CLIENTES
// ========================================

// GET /api/reportes/clientes/mas-frecuentes - Clientes más frecuentes
router.get('/clientes/mas-frecuentes', ReporteController.obtenerClientesMasFrecuentes);

// GET /api/reportes/clientes/por-valor-compras - Clientes por valor de compras
router.get('/clientes/por-valor-compras', ReporteController.obtenerClientesPorValorCompras);

// ========================================
// REPORTES FINANCIEROS
// ========================================

// GET /api/reportes/financieros/ingresos-por-periodo - Ingresos por período
router.get('/financieros/ingresos-por-periodo', ReporteController.obtenerIngresosPorPeriodo);

// GET /api/reportes/financieros/gastos-por-compras - Gastos por compras
router.get('/financieros/gastos-por-compras', ReporteController.obtenerGastosPorCompras);

// ========================================
// REPORTES DE PROVEEDORES
// ========================================

// GET /api/reportes/proveedores/por-estado - Proveedores por estado
router.get('/proveedores/por-estado', ReporteController.obtenerProveedoresPorEstado);

// ========================================
// DASHBOARD EJECUTIVO
// ========================================

// GET /api/reportes/estadisticas - Estadísticas generales
router.get('/estadisticas', ReporteController.obtenerEstadisticas);

// GET /api/reportes/dashboard-ejecutivo - Dashboard ejecutivo completo
router.get('/dashboard-ejecutivo', ReporteController.obtenerDashboardEjecutivo);

module.exports = router;
