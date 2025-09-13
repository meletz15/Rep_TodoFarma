const Joi = require('joi');
const VentaModel = require('../models/ventaModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaCrearVenta = Joi.object({
  cliente_id: Joi.number().integer().positive().allow(null).messages({
    'number.base': 'El ID del cliente debe ser un número',
    'number.integer': 'El ID del cliente debe ser un número entero',
    'number.positive': 'El ID del cliente debe ser positivo'
  }),
  usuario_id: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del usuario debe ser un número',
    'number.integer': 'El ID del usuario debe ser un número entero',
    'number.positive': 'El ID del usuario debe ser positivo',
    'any.required': 'El usuario es requerido'
  }),
  fecha: Joi.date().allow(null).messages({
    'date.base': 'La fecha debe ser una fecha válida'
  }),
  estado: Joi.string().valid('EMITIDA', 'ANULADA').default('EMITIDA').messages({
    'any.only': 'El estado debe ser uno de: EMITIDA, ANULADA'
  }),
  total: Joi.number().min(0).precision(2).default(0.00).messages({
    'number.min': 'El total no puede ser negativo',
    'number.precision': 'El total debe tener máximo 2 decimales'
  }),
  observacion: Joi.string().max(300).allow('', null).messages({
    'string.max': 'La observación no puede exceder 300 caracteres'
  }),
  detalles: Joi.array().items(
    Joi.object({
      id_producto: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del producto debe ser un número',
        'number.integer': 'El ID del producto debe ser un número entero',
        'number.positive': 'El ID del producto debe ser positivo',
        'any.required': 'El producto es requerido'
      }),
      cantidad: Joi.number().integer().positive().required().messages({
        'number.base': 'La cantidad debe ser un número',
        'number.integer': 'La cantidad debe ser un número entero',
        'number.positive': 'La cantidad debe ser positiva',
        'any.required': 'La cantidad es requerida'
      }),
      precio_unitario: Joi.number().min(0).precision(2).required().messages({
        'number.min': 'El precio unitario no puede ser negativo',
        'number.precision': 'El precio unitario debe tener máximo 2 decimales',
        'any.required': 'El precio unitario es requerido'
      })
    })
  ).min(1).required().messages({
    'array.min': 'Debe incluir al menos un detalle de la venta',
    'any.required': 'Los detalles de la venta son requeridos'
  })
});

const esquemaAnularVenta = Joi.object({
  motivo: Joi.string().max(300).allow('', null).messages({
    'string.max': 'El motivo no puede exceder 300 caracteres'
  })
});

class VentaController {
  // Crear nueva venta
  static async crear(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = esquemaCrearVenta.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Crear venta
      const venta = await VentaModel.crear(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Venta creada correctamente',
        datos: venta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las ventas con paginación y filtros
  static async obtenerVentas(req, res, next) {
    try {
      const { pagina, limite, estado, cliente_id, usuario_id, caja_id, fecha_desde, fecha_hasta, busqueda } = req.query;
      
      // Validar parámetros de paginación
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      // Construir filtros
      const filtros = {};
      if (estado) filtros.estado = estado;
      if (cliente_id) filtros.cliente_id = parseInt(cliente_id);
      if (usuario_id) filtros.usuario_id = parseInt(usuario_id);
      if (caja_id) filtros.caja_id = parseInt(caja_id);
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;
      if (busqueda) filtros.busqueda = busqueda;
      
      // Obtener ventas
      const resultado = await VentaModel.obtenerVentas(filtros, paginacion);
      
      // Construir respuesta paginada
      const respuesta = construirRespuestaPaginada(
        resultado.ventas,
        resultado.total,
        paginacionValida.pagina,
        paginacionValida.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Ventas obtenidas correctamente',
        datos: respuesta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener venta por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id_venta } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_venta);
      if (isNaN(id)) {
        throw crearError('ID de venta inválido', 400);
      }
      
      // Obtener venta
      const venta = await VentaModel.obtenerPorId(id);
      
      res.json({
        ok: true,
        mensaje: 'Venta obtenida correctamente',
        datos: venta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Anular venta
  static async anularVenta(req, res, next) {
    try {
      const { id_venta } = req.params;
      const datosAnulacion = req.body;
      
      // Validar que el ID sea un número
      const id = parseInt(id_venta);
      if (isNaN(id)) {
        throw crearError('ID de venta inválido', 400);
      }
      
      // Validar datos de entrada
      const { error, value } = esquemaAnularVenta.validate(datosAnulacion);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Anular venta
      const venta = await VentaModel.anularVenta(id, value.motivo);
      
      res.json({
        ok: true,
        mensaje: 'Venta anulada correctamente',
        datos: venta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas de ventas
  static async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await VentaModel.obtenerEstadisticas();
      
      res.json({
        ok: true,
        mensaje: 'Estadísticas de ventas obtenidas correctamente',
        datos: estadisticas
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener ventas por rango de fechas
  static async obtenerVentasPorRangoFechas(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Las fechas desde y hasta son requeridas', 400);
      }
      
      // Validar formato de fechas
      const fechaDesde = new Date(desde);
      const fechaHasta = new Date(hasta);
      
      if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
        throw crearError('Formato de fecha inválido', 400);
      }
      
      if (fechaDesde > fechaHasta) {
        throw crearError('La fecha desde no puede ser mayor a la fecha hasta', 400);
      }
      
      const ventas = await VentaModel.obtenerVentasPorRangoFechas(desde, hasta);
      
      res.json({
        ok: true,
        mensaje: 'Ventas obtenidas correctamente',
        datos: ventas
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener productos más vendidos
  static async obtenerProductosMasVendidos(req, res, next) {
    try {
      const { limite, fecha_desde, fecha_hasta } = req.query;
      
      const limiteNum = limite ? parseInt(limite) : 10;
      if (isNaN(limiteNum) || limiteNum < 1) {
        throw crearError('El límite debe ser un número positivo', 400);
      }
      
      // Validar fechas si se proporcionan
      let fechaDesde = null;
      let fechaHasta = null;
      
      if (fecha_desde) {
        fechaDesde = new Date(fecha_desde);
        if (isNaN(fechaDesde.getTime())) {
          throw crearError('Formato de fecha desde inválido', 400);
        }
      }
      
      if (fecha_hasta) {
        fechaHasta = new Date(fecha_hasta);
        if (isNaN(fechaHasta.getTime())) {
          throw crearError('Formato de fecha hasta inválido', 400);
        }
      }
      
      if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
        throw crearError('La fecha desde no puede ser mayor a la fecha hasta', 400);
      }
      
      const productos = await VentaModel.obtenerProductosMasVendidos(limiteNum, fechaDesde, fechaHasta);
      
      res.json({
        ok: true,
        mensaje: 'Productos más vendidos obtenidos correctamente',
        datos: productos
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VentaController;
