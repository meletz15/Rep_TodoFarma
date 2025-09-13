const Joi = require('joi');
const InventarioModel = require('../models/inventarioModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaCrearMovimiento = Joi.object({
  producto_id: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del producto debe ser un número',
    'number.integer': 'El ID del producto debe ser un número entero',
    'number.positive': 'El ID del producto debe ser positivo',
    'any.required': 'El producto es requerido'
  }),
  tipo: Joi.string().valid('AJUSTE_ENTRADA', 'AJUSTE_SALIDA', 'DEVOLUCION_COMPRA', 'DEVOLUCION_CLIENTE').required().messages({
    'any.only': 'El tipo debe ser uno de: AJUSTE_ENTRADA, AJUSTE_SALIDA, DEVOLUCION_COMPRA, DEVOLUCION_CLIENTE',
    'any.required': 'El tipo es requerido'
  }),
  cantidad: Joi.number().integer().positive().required().messages({
    'number.base': 'La cantidad debe ser un número',
    'number.integer': 'La cantidad debe ser un número entero',
    'number.positive': 'La cantidad debe ser positiva',
    'any.required': 'La cantidad es requerida'
  }),
  signo: Joi.number().integer().valid(1, -1).required().messages({
    'number.base': 'El signo debe ser un número',
    'number.integer': 'El signo debe ser un número entero',
    'any.only': 'El signo debe ser 1 (entrada) o -1 (salida)',
    'any.required': 'El signo es requerido'
  }),
  referencia: Joi.string().max(100).allow('', null).messages({
    'string.max': 'La referencia no puede exceder 100 caracteres'
  }),
  usuario_id: Joi.number().integer().positive().allow(null).messages({
    'number.base': 'El ID del usuario debe ser un número',
    'number.integer': 'El ID del usuario debe ser un número entero',
    'number.positive': 'El ID del usuario debe ser positivo'
  }),
  observacion: Joi.string().max(300).allow('', null).messages({
    'string.max': 'La observación no puede exceder 300 caracteres'
  })
});

class InventarioController {
  // Obtener movimientos de inventario con paginación y filtros
  static async obtenerMovimientos(req, res, next) {
    try {
      const { pagina, limite, producto_id, tipo, fecha_desde, fecha_hasta, busqueda } = req.query;
      
      // Validar parámetros de paginación
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      // Construir filtros
      const filtros = {};
      if (producto_id) filtros.producto_id = parseInt(producto_id);
      if (tipo) filtros.tipo = tipo;
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;
      if (busqueda) filtros.busqueda = busqueda;
      
      // Obtener movimientos
      const resultado = await InventarioModel.obtenerMovimientos(filtros, paginacion);
      
      // Construir respuesta paginada
      const respuesta = construirRespuestaPaginada(
        resultado.movimientos,
        resultado.total,
        paginacionValida.pagina,
        paginacionValida.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Movimientos de inventario obtenidos correctamente',
        datos: respuesta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener kardex de un producto específico
  static async obtenerKardexProducto(req, res, next) {
    try {
      const { id_producto } = req.params;
      const { pagina, limite, fecha_desde, fecha_hasta } = req.query;
      
      // Validar que el ID sea un número
      const id = parseInt(id_producto);
      if (isNaN(id)) {
        throw crearError('ID de producto inválido', 400);
      }
      
      // Validar parámetros de paginación
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      // Construir filtros
      const filtros = {};
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;
      
      // Obtener kardex
      const resultado = await InventarioModel.obtenerKardexProducto(id, filtros, paginacion);
      
      // Construir respuesta paginada
      const respuesta = construirRespuestaPaginada(
        resultado.kardex,
        resultado.total,
        paginacionValida.pagina,
        paginacionValida.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Kardex del producto obtenido correctamente',
        datos: respuesta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Crear movimiento de inventario manual
  static async crearMovimiento(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = esquemaCrearMovimiento.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Crear movimiento
      const movimiento = await InventarioModel.crearMovimiento(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Movimiento de inventario creado correctamente',
        datos: movimiento
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas de inventario
  static async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await InventarioModel.obtenerEstadisticas();
      
      res.json({
        ok: true,
        mensaje: 'Estadísticas de inventario obtenidas correctamente',
        datos: estadisticas
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener productos con stock bajo
  static async obtenerProductosStockBajo(req, res, next) {
    try {
      const { limite_stock } = req.query;
      const limite = limite_stock ? parseInt(limite_stock) : 10;
      
      if (isNaN(limite) || limite < 0) {
        throw crearError('El límite de stock debe ser un número positivo', 400);
      }
      
      const productos = await InventarioModel.obtenerProductosBajoStock(limite);
      
      res.json({
        ok: true,
        mensaje: 'Productos con stock bajo obtenidos correctamente',
        datos: productos
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener productos próximos a vencer
  static async obtenerProductosPorVencer(req, res, next) {
    try {
      const { dias } = req.query;
      const diasLimite = dias ? parseInt(dias) : 30;
      
      if (isNaN(diasLimite) || diasLimite < 0) {
        throw crearError('Los días deben ser un número positivo', 400);
      }
      
      const productos = await InventarioModel.obtenerProductosPorVencer(diasLimite);
      
      res.json({
        ok: true,
        mensaje: 'Productos próximos a vencer obtenidos correctamente',
        datos: productos
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener resumen de inventario por categoría
  static async obtenerResumenPorCategoria(req, res, next) {
    try {
      const resumen = await InventarioModel.obtenerResumenCategoria();
      
      res.json({
        ok: true,
        mensaje: 'Resumen de inventario por categoría obtenido correctamente',
        datos: resumen
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InventarioController;
