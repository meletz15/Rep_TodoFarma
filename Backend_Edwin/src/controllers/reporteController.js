const UsuarioModel = require('../models/usuarioModel');
const { crearError } = require('../utils/errorHandler');

class ReporteController {
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

  // Obtener estadísticas generales
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
}

module.exports = ReporteController;
