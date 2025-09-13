const Joi = require('joi');
const CajaModel = require('../models/cajaModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaAbrirCaja = Joi.object({
  usuario_apertura: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del usuario debe ser un número',
    'number.integer': 'El ID del usuario debe ser un número entero',
    'number.positive': 'El ID del usuario debe ser positivo',
    'any.required': 'El usuario es requerido'
  }),
  saldo_inicial: Joi.number().min(0).precision(2).default(0.00).messages({
    'number.min': 'El saldo inicial no puede ser negativo',
    'number.precision': 'El saldo inicial debe tener máximo 2 decimales'
  }),
  observacion: Joi.string().max(300).allow('', null).messages({
    'string.max': 'La observación no puede exceder 300 caracteres'
  })
});

const esquemaCerrarCaja = Joi.object({
  usuario_cierre: Joi.number().integer().positive().allow(null).messages({
    'number.base': 'El ID del usuario debe ser un número',
    'number.integer': 'El ID del usuario debe ser un número entero',
    'number.positive': 'El ID del usuario debe ser positivo'
  }),
  observacion: Joi.string().max(300).allow('', null).messages({
    'string.max': 'La observación no puede exceder 300 caracteres'
  })
});

class CajaController {
  // Abrir caja
  static async abrirCaja(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = esquemaAbrirCaja.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Abrir caja
      const caja = await CajaModel.abrirCaja(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Caja abierta correctamente',
        datos: caja
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Cerrar caja
  static async cerrarCaja(req, res, next) {
    try {
      const { id_caja } = req.params;
      const datosCierre = req.body;
      
      // Validar que el ID sea un número
      const id = parseInt(id_caja);
      if (isNaN(id)) {
        throw crearError('ID de caja inválido', 400);
      }
      
      // Validar datos de entrada
      const { error, value } = esquemaCerrarCaja.validate(datosCierre);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Cerrar caja
      const caja = await CajaModel.cerrarCaja(id, value);
      
      res.json({
        ok: true,
        mensaje: 'Caja cerrada correctamente',
        datos: caja
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener caja abierta
  static async obtenerCajaAbierta(req, res, next) {
    try {
      const caja = await CajaModel.obtenerCajaAbierta();
      
      if (!caja) {
        return res.json({
          ok: true,
          mensaje: 'No hay caja abierta',
          datos: null
        });
      }
      
      res.json({
        ok: true,
        mensaje: 'Caja abierta obtenida correctamente',
        datos: caja
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las cajas con paginación y filtros
  static async obtenerCajas(req, res, next) {
    try {
      const { pagina, limite, estado, usuario_apertura, fecha_desde, fecha_hasta } = req.query;
      
      // Validar parámetros de paginación
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      // Construir filtros
      const filtros = {};
      if (estado) filtros.estado = estado;
      if (usuario_apertura) filtros.usuario_apertura = parseInt(usuario_apertura);
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;
      
      // Obtener cajas
      const resultado = await CajaModel.obtenerCajas(filtros, paginacion);
      
      // Construir respuesta paginada
      const respuesta = construirRespuestaPaginada(
        resultado.cajas,
        resultado.total,
        paginacionValida.pagina,
        paginacionValida.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Cajas obtenidas correctamente',
        datos: respuesta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener caja por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id_caja } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_caja);
      if (isNaN(id)) {
        throw crearError('ID de caja inválido', 400);
      }
      
      // Obtener caja
      const caja = await CajaModel.obtenerPorId(id);
      
      res.json({
        ok: true,
        mensaje: 'Caja obtenida correctamente',
        datos: caja
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas de caja
  static async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await CajaModel.obtenerEstadisticas();
      
      res.json({
        ok: true,
        mensaje: 'Estadísticas de caja obtenidas correctamente',
        datos: estadisticas
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Verificar si hay caja abierta
  static async verificarCajaAbierta(req, res, next) {
    try {
      const hayCajaAbierta = await CajaModel.hayCajaAbierta();
      
      res.json({
        ok: true,
        mensaje: 'Estado de caja verificado correctamente',
        datos: {
          hay_caja_abierta: hayCajaAbierta
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener resumen de caja por día
  static async obtenerResumenPorDia(req, res, next) {
    try {
      const { fecha } = req.query;
      
      if (!fecha) {
        throw crearError('La fecha es requerida', 400);
      }
      
      // Validar formato de fecha
      const fechaValidada = new Date(fecha);
      if (isNaN(fechaValidada.getTime())) {
        throw crearError('Formato de fecha inválido', 400);
      }
      
      const resumen = await CajaModel.obtenerResumenPorDia(fecha);
      
      res.json({
        ok: true,
        mensaje: 'Resumen de caja por día obtenido correctamente',
        datos: resumen
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CajaController;
