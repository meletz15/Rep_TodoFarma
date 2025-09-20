const UsuarioModel = require('../models/usuarioModel');
const VentaModel = require('../models/ventaModel');
const InventarioModel = require('../models/inventarioModel');
const CajaModel = require('../models/cajaModel');
const PedidoModel = require('../models/pedidoModel');
const ProductoModel = require('../models/productoModel');
const ClienteModel = require('../models/clienteModel');
const ProveedorModel = require('../models/proveedorModel');
const { crearError } = require('../utils/errorHandler');

class ReporteController {
  // ========================================
  // REPORTES DE USUARIOS (EXISTENTES)
  // ========================================
  
  // Obtener reporte de usuarios activos
  static async obtenerUsuariosActivos(req, res, next) {
    try {
      const { pagina, limite } = req.query;
      
      // Configurar paginación
      const paginaNum = parseInt(pagina) || 1;
      const limiteNum = parseInt(limite) || 10;
      const offset = (paginaNum - 1) * limiteNum;
      
      // Obtener usuarios activos
      const resultado = await UsuarioModel.obtenerTodos(
        { estado: 'ACTIVO' },
        { limite: limiteNum, offset }
      );
      
      // Obtener estadísticas
      const estadisticas = await UsuarioModel.obtenerEstadisticas();
      
      res.json({
        ok: true,
        mensaje: 'Reporte de usuarios activos obtenido correctamente',
        datos: {
          usuarios: resultado.usuarios,
          total: resultado.total,
          paginacion: {
            pagina: paginaNum,
            limite: limiteNum,
            total: resultado.total,
            totalPaginas: Math.ceil(resultado.total / limiteNum),
            tieneSiguiente: paginaNum < Math.ceil(resultado.total / limiteNum),
            tieneAnterior: paginaNum > 1
          },
          estadisticas: {
            total_usuarios: estadisticas.total_usuarios,
            usuarios_activos: estadisticas.usuarios_activos,
            usuarios_inactivos: estadisticas.usuarios_inactivos,
            nuevos_ultimo_mes: estadisticas.nuevos_ultimo_mes
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener reporte de usuarios inactivos
  static async obtenerUsuariosInactivos(req, res, next) {
    try {
      const { pagina, limite } = req.query;
      
      // Configurar paginación
      const paginaNum = parseInt(pagina) || 1;
      const limiteNum = parseInt(limite) || 10;
      const offset = (paginaNum - 1) * limiteNum;
      
      // Obtener usuarios inactivos
      const resultado = await UsuarioModel.obtenerTodos(
        { estado: 'INACTIVO' },
        { limite: limiteNum, offset }
      );
      
      // Obtener estadísticas
      const estadisticas = await UsuarioModel.obtenerEstadisticas();
      
      res.json({
        ok: true,
        mensaje: 'Reporte de usuarios inactivos obtenido correctamente',
        datos: {
          usuarios: resultado.usuarios,
          total: resultado.total,
          paginacion: {
            pagina: paginaNum,
            limite: limiteNum,
            total: resultado.total,
            totalPaginas: Math.ceil(resultado.total / limiteNum),
            tieneSiguiente: paginaNum < Math.ceil(resultado.total / limiteNum),
            tieneAnterior: paginaNum > 1
          },
          estadisticas: {
            total_usuarios: estadisticas.total_usuarios,
            usuarios_activos: estadisticas.usuarios_activos,
            usuarios_inactivos: estadisticas.usuarios_inactivos,
            nuevos_ultimo_mes: estadisticas.nuevos_ultimo_mes
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener reporte de usuarios por rango de fechas
  static async obtenerUsuariosPorFecha(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      
      // Validar parámetros de fecha
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos (formato: YYYY-MM-DD)', 400);
      }
      
      // Validar formato de fechas
      const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
      if (!regexFecha.test(desde) || !regexFecha.test(hasta)) {
        throw crearError('El formato de fecha debe ser YYYY-MM-DD', 400);
      }
      
      // Validar que la fecha desde no sea mayor que hasta
      const fechaDesde = new Date(desde);
      const fechaHasta = new Date(hasta);
      
      if (fechaDesde > fechaHasta) {
        throw crearError('La fecha "desde" no puede ser mayor que la fecha "hasta"', 400);
      }
      
      // Validar que las fechas no sean futuras
      const fechaActual = new Date();
      if (fechaDesde > fechaActual || fechaHasta > fechaActual) {
        throw crearError('Las fechas no pueden ser futuras', 400);
      }
      
      // Obtener usuarios por rango de fechas
      const usuarios = await UsuarioModel.obtenerPorRangoFechas(desde, hasta);
      
      // Obtener estadísticas
      const estadisticas = await UsuarioModel.obtenerEstadisticas();
      
      res.json({
        ok: true,
        mensaje: 'Reporte de usuarios por fecha obtenido correctamente',
        datos: {
          usuarios,
          total: usuarios.length,
          filtros: {
            desde,
            hasta,
            rango_dias: Math.ceil((fechaHasta - fechaDesde) / (1000 * 60 * 60 * 24)) + 1
          },
          estadisticas: {
            total_usuarios: estadisticas.total_usuarios,
            usuarios_activos: estadisticas.usuarios_activos,
            usuarios_inactivos: estadisticas.usuarios_inactivos,
            nuevos_ultimo_mes: estadisticas.nuevos_ultimo_mes
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // REPORTES DE VENTAS
  // ========================================

  // Ventas por período
  static async obtenerVentasPorPeriodo(req, res, next) {
    try {
      const { desde, hasta, estado, usuario_id, cliente_id } = req.query;
      
      // Validar parámetros de fecha
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos (formato: YYYY-MM-DD)', 400);
      }
      
      const filtros = {
        fecha_desde: desde,
        fecha_hasta: hasta,
        estado: estado || undefined,
        usuario_id: usuario_id ? parseInt(usuario_id) : undefined,
        cliente_id: cliente_id ? parseInt(cliente_id) : undefined
      };
      
      const ventas = await VentaModel.obtenerVentas(filtros, {});
      
      // Calcular estadísticas
      const totalVentas = ventas.ventas.length;
      const totalMonto = ventas.ventas.reduce((sum, venta) => sum + parseFloat(venta.total), 0);
      const ticketPromedio = totalVentas > 0 ? (totalMonto / totalVentas).toFixed(2) : 0;
      
      res.json({
        ok: true,
        mensaje: 'Reporte de ventas por período obtenido correctamente',
        datos: {
          ventas: ventas.ventas,
          total: totalVentas,
          estadisticas: {
            total_ventas: totalVentas,
            total_monto: parseFloat(totalMonto.toFixed(2)),
            ticket_promedio: parseFloat(ticketPromedio),
            filtros
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Ventas por usuario/empleado
  static async obtenerVentasPorUsuario(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const ventas = await VentaModel.obtenerVentasPorUsuario(desde, hasta);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de ventas por usuario obtenido correctamente',
        datos: {
          ventas_por_usuario: ventas,
          total_usuarios: ventas.length,
          filtros: { desde, hasta }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Ventas por cliente
  static async obtenerVentasPorCliente(req, res, next) {
    try {
      const { desde, hasta, limite = 10 } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const ventas = await VentaModel.obtenerVentasPorCliente(desde, hasta, parseInt(limite));
      
      res.json({
        ok: true,
        mensaje: 'Reporte de ventas por cliente obtenido correctamente',
        datos: {
          ventas_por_cliente: ventas,
          total_clientes: ventas.length,
          filtros: { desde, hasta, limite: parseInt(limite) }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Productos más vendidos
  static async obtenerProductosMasVendidos(req, res, next) {
    try {
      const { desde, hasta, limite = 10 } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const productos = await VentaModel.obtenerProductosMasVendidos(desde, hasta, parseInt(limite));
      
      res.json({
        ok: true,
        mensaje: 'Reporte de productos más vendidos obtenido correctamente',
        datos: {
          productos_mas_vendidos: productos,
          total_productos: productos.length,
          filtros: { desde, hasta, limite: parseInt(limite) }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // REPORTES DE INVENTARIO
  // ========================================

  // Movimientos de inventario
  static async obtenerMovimientosInventario(req, res, next) {
    try {
      const { desde, hasta, tipo, producto_id } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const filtros = {
        fecha_desde: desde,
        fecha_hasta: hasta,
        tipo: tipo || undefined,
        producto_id: producto_id ? parseInt(producto_id) : undefined
      };
      
      const movimientos = await InventarioModel.obtenerMovimientos(filtros, {});
      
      res.json({
        ok: true,
        mensaje: 'Reporte de movimientos de inventario obtenido correctamente',
        datos: {
          movimientos: movimientos.movimientos,
          total: movimientos.total,
          filtros
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Stock actual
  static async obtenerStockActual(req, res, next) {
    try {
      const { categoria_id, marca_id, stock_bajo = false } = req.query;
      
      const filtros = {
        categoria_id: categoria_id ? parseInt(categoria_id) : undefined,
        marca_id: marca_id ? parseInt(marca_id) : undefined,
        stock_bajo: stock_bajo === 'true'
      };
      
      const productos = await ProductoModel.obtenerStockActual(filtros);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de stock actual obtenido correctamente',
        datos: {
          productos: productos,
          total_productos: productos.length,
          filtros
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Productos próximos a vencer
  static async obtenerProductosProximosAVencer(req, res, next) {
    try {
      const { dias = 30 } = req.query;
      
      const productos = await ProductoModel.obtenerProductosProximosAVencer(parseInt(dias));
      
      res.json({
        ok: true,
        mensaje: 'Reporte de productos próximos a vencer obtenido correctamente',
        datos: {
          productos: productos,
          total_productos: productos.length,
          filtros: { dias: parseInt(dias) }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // REPORTES DE CAJA
  // ========================================

  // Resumen diario de caja
  static async obtenerResumenDiarioCaja(req, res, next) {
    try {
      const { fecha } = req.query;
      
      if (!fecha) {
        throw crearError('El parámetro "fecha" es requerido (formato: YYYY-MM-DD)', 400);
      }
      
      const resumen = await CajaModel.obtenerResumenPorDia(fecha);
      
      res.json({
        ok: true,
        mensaje: 'Resumen diario de caja obtenido correctamente',
        datos: {
          resumen,
          fecha
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Histórico de cajas
  static async obtenerHistoricoCajas(req, res, next) {
    try {
      const { desde, hasta, estado } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const filtros = {
        fecha_desde: desde,
        fecha_hasta: hasta,
        estado: estado || undefined
      };
      
      const cajas = await CajaModel.obtenerHistorico(filtros);
      
      res.json({
        ok: true,
        mensaje: 'Histórico de cajas obtenido correctamente',
        datos: {
          cajas: cajas,
          total_cajas: cajas.length,
          filtros
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // REPORTES DE PEDIDOS
  // ========================================

  // Pedidos por estado
  static async obtenerPedidosPorEstado(req, res, next) {
    try {
      const { desde, hasta, estado, proveedor_id } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const filtros = {
        fecha_desde: desde,
        fecha_hasta: hasta,
        estado: estado || undefined,
        proveedor_id: proveedor_id ? parseInt(proveedor_id) : undefined
      };
      
      const pedidos = await PedidoModel.obtenerTodos(filtros, {});
      
      res.json({
        ok: true,
        mensaje: 'Reporte de pedidos por estado obtenido correctamente',
        datos: {
          pedidos: pedidos.pedidos,
          total: pedidos.total,
          filtros
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Análisis de proveedores
  static async obtenerAnalisisProveedores(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const proveedores = await PedidoModel.obtenerAnalisisProveedores(desde, hasta);
      
      res.json({
        ok: true,
        mensaje: 'Análisis de proveedores obtenido correctamente',
        datos: {
          proveedores: proveedores,
          total_proveedores: proveedores.length,
          filtros: { desde, hasta }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // REPORTES DE PRODUCTOS
  // ========================================

  // Productos por categoría
  static async obtenerProductosPorCategoria(req, res, next) {
    try {
      const { activo = true } = req.query;
      
      const productos = await ProductoModel.obtenerProductosPorCategoria(activo === 'true');
      
      res.json({
        ok: true,
        mensaje: 'Reporte de productos por categoría obtenido correctamente',
        datos: {
          productos_por_categoria: productos,
          total_categorias: productos.length,
          filtros: { activo: activo === 'true' }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Productos por marca
  static async obtenerProductosPorMarca(req, res, next) {
    try {
      const { activo = true } = req.query;
      
      const productos = await ProductoModel.obtenerProductosPorMarca(activo === 'true');
      
      res.json({
        ok: true,
        mensaje: 'Reporte de productos por marca obtenido correctamente',
        datos: {
          productos_por_marca: productos,
          total_marcas: productos.length,
          filtros: { activo: activo === 'true' }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // REPORTES DE CLIENTES
  // ========================================

  // Clientes más frecuentes
  static async obtenerClientesMasFrecuentes(req, res, next) {
    try {
      const { desde, hasta, limite = 10 } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const clientes = await ClienteModel.obtenerClientesMasFrecuentes(desde, hasta, parseInt(limite));
      
      res.json({
        ok: true,
        mensaje: 'Reporte de clientes más frecuentes obtenido correctamente',
        datos: {
          clientes_mas_frecuentes: clientes,
          total_clientes: clientes.length,
          filtros: { desde, hasta, limite: parseInt(limite) }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Clientes por valor de compras
  static async obtenerClientesPorValorCompras(req, res, next) {
    try {
      const { desde, hasta, limite = 10 } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const clientes = await ClienteModel.obtenerClientesPorValorCompras(desde, hasta, parseInt(limite));
      
      res.json({
        ok: true,
        mensaje: 'Reporte de clientes por valor de compras obtenido correctamente',
        datos: {
          clientes_por_valor: clientes,
          total_clientes: clientes.length,
          filtros: { desde, hasta, limite: parseInt(limite) }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // REPORTES FINANCIEROS
  // ========================================

  // Ingresos por período
  static async obtenerIngresosPorPeriodo(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const ingresos = await VentaModel.obtenerIngresosPorPeriodo(desde, hasta);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de ingresos por período obtenido correctamente',
        datos: {
          ingresos: ingresos,
          filtros: { desde, hasta }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Gastos por compras
  static async obtenerGastosPorCompras(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      const gastos = await PedidoModel.obtenerGastosPorCompras(desde, hasta);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de gastos por compras obtenido correctamente',
        datos: {
          gastos: gastos,
          filtros: { desde, hasta }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // REPORTES DE PROVEEDORES
  // ========================================

  // Proveedores activos/inactivos
  static async obtenerProveedoresPorEstado(req, res, next) {
    try {
      const { estado } = req.query;
      
      const filtros = {
        estado: estado || undefined
      };
      
      const proveedores = await ProveedorModel.obtenerTodos(filtros, {});
      
      res.json({
        ok: true,
        mensaje: 'Reporte de proveedores por estado obtenido correctamente',
        datos: {
          proveedores: proveedores.proveedores,
          total: proveedores.total,
          filtros
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // ========================================
  // DASHBOARD EJECUTIVO
  // ========================================

  // Estadísticas generales del sistema
  static async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await UsuarioModel.obtenerEstadisticas();
      
      // Calcular porcentajes
      const porcentajeActivos = estadisticas.total_usuarios > 0 
        ? ((estadisticas.usuarios_activos / estadisticas.total_usuarios) * 100).toFixed(2)
        : 0;
      
      const porcentajeInactivos = estadisticas.total_usuarios > 0
        ? ((estadisticas.usuarios_inactivos / estadisticas.total_usuarios) * 100).toFixed(2)
        : 0;
      
      const porcentajeNuevos = estadisticas.total_usuarios > 0
        ? ((estadisticas.nuevos_ultimo_mes / estadisticas.total_usuarios) * 100).toFixed(2)
        : 0;
      
      res.json({
        ok: true,
        mensaje: 'Estadísticas obtenidas correctamente',
        datos: {
          total_usuarios: estadisticas.total_usuarios,
          usuarios_activos: {
            cantidad: estadisticas.usuarios_activos,
            porcentaje: porcentajeActivos
          },
          usuarios_inactivos: {
            cantidad: estadisticas.usuarios_inactivos,
            porcentaje: porcentajeInactivos
          },
          nuevos_ultimo_mes: {
            cantidad: estadisticas.nuevos_ultimo_mes,
            porcentaje: porcentajeNuevos
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Dashboard ejecutivo completo
  static async obtenerDashboardEjecutivo(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Los parámetros "desde" y "hasta" son requeridos', 400);
      }
      
      // Obtener estadísticas de diferentes módulos
      const [ventas, inventario, caja, pedidos] = await Promise.all([
        VentaModel.obtenerEstadisticasDashboard(desde, hasta),
        InventarioModel.obtenerEstadisticasDashboard(),
        CajaModel.obtenerEstadisticasDashboard(desde, hasta),
        PedidoModel.obtenerEstadisticasDashboard(desde, hasta)
      ]);
      
      res.json({
        ok: true,
        mensaje: 'Dashboard ejecutivo obtenido correctamente',
        datos: {
          ventas,
          inventario,
          caja,
          pedidos,
          filtros: { desde, hasta },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReporteController;
