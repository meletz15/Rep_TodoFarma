const Joi = require('joi');
const PedidoModel = require('../models/pedidoModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaCrearPedido = Joi.object({
  proveedor_id: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del proveedor debe ser un número',
    'number.integer': 'El ID del proveedor debe ser un número entero',
    'number.positive': 'El ID del proveedor debe ser positivo',
    'any.required': 'El proveedor es requerido'
  }),
  usuario_id: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del usuario debe ser un número',
    'number.integer': 'El ID del usuario debe ser un número entero',
    'number.positive': 'El ID del usuario debe ser positivo',
    'any.required': 'El usuario es requerido'
  }),
  fecha_pedido: Joi.date().allow(null).messages({
    'date.base': 'La fecha del pedido debe ser una fecha válida'
  }),
  estado: Joi.string().valid('CREADO', 'ENVIADO', 'RECIBIDO', 'CANCELADO').default('CREADO').messages({
    'any.only': 'El estado debe ser uno de: CREADO, ENVIADO, RECIBIDO, CANCELADO'
  }),
  total_costo: Joi.number().min(0).precision(2).default(0.00).messages({
    'number.min': 'El total del costo no puede ser negativo',
    'number.precision': 'El total del costo debe tener máximo 2 decimales'
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
      costo_unitario: Joi.number().min(0).precision(2).required().messages({
        'number.min': 'El costo unitario no puede ser negativo',
        'number.precision': 'El costo unitario debe tener máximo 2 decimales',
        'any.required': 'El costo unitario es requerido'
      })
    })
  ).min(1).required().messages({
    'array.min': 'Debe incluir al menos un detalle del pedido',
    'any.required': 'Los detalles del pedido son requeridos'
  })
});

const esquemaActualizarEstado = Joi.object({
  estado: Joi.string().valid('CREADO', 'ENVIADO', 'RECIBIDO', 'CANCELADO').required().messages({
    'any.only': 'El estado debe ser uno de: CREADO, ENVIADO, RECIBIDO, CANCELADO',
    'any.required': 'El estado es requerido'
  })
});

class PedidoController {
  // Crear nuevo pedido
  static async crear(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = esquemaCrearPedido.validate(req.body);
      if (error) {
        console.error('Error de validación:', error.details);
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      console.log('Datos validados:', value);
      
      // Crear pedido
      const pedido = await PedidoModel.crear(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Pedido creado correctamente',
        datos: pedido
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los pedidos con paginación y filtros
  static async obtenerTodos(req, res, next) {
    try {
      const { pagina, limite, estado, proveedor_id, fecha_desde, fecha_hasta, busqueda } = req.query;
      
      // Validar parámetros de paginación
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      // Construir filtros
      const filtros = {};
      if (estado) filtros.estado = estado;
      if (proveedor_id) filtros.proveedor_id = parseInt(proveedor_id);
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;
      if (busqueda) filtros.busqueda = busqueda;
      
      // Obtener pedidos
      const resultado = await PedidoModel.obtenerTodos(filtros, paginacion);
      
      // Construir respuesta paginada
      const respuesta = construirRespuestaPaginada(
        resultado.pedidos,
        resultado.total,
        paginacionValida.pagina,
        paginacionValida.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Pedidos obtenidos correctamente',
        datos: respuesta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener pedido por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id_pedido } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_pedido);
      if (isNaN(id)) {
        throw crearError('ID de pedido inválido', 400);
      }
      
      // Obtener pedido
      const pedido = await PedidoModel.obtenerPorId(id);
      
      res.json({
        ok: true,
        mensaje: 'Pedido obtenido correctamente',
        datos: pedido
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Actualizar estado del pedido
  static async actualizarEstado(req, res, next) {
    try {
      const { id_pedido } = req.params;
      const datosActualizacion = req.body;
      
      // Validar que el ID sea un número
      const id = parseInt(id_pedido);
      if (isNaN(id)) {
        throw crearError('ID de pedido inválido', 400);
      }
      
      // Validar datos de entrada
      const { error, value } = esquemaActualizarEstado.validate(datosActualizacion);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Actualizar estado del pedido
      const pedido = await PedidoModel.actualizarEstado(id, value.estado);
      
      res.json({
        ok: true,
        mensaje: 'Estado del pedido actualizado correctamente',
        datos: pedido
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas de pedidos
  static async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await PedidoModel.obtenerEstadisticas();
      
      res.json({
        ok: true,
        mensaje: 'Estadísticas obtenidas correctamente',
        datos: estadisticas
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PedidoController;
