const Joi = require('joi');
const ProductoModel = require('../models/productoModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaCrearProducto = Joi.object({
  nombre: Joi.string().min(2).max(140).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 140 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  descripcion: Joi.string().max(500).allow('', null).messages({
    'string.max': 'La descripción no puede exceder 500 caracteres'
  }),
  sku: Joi.string().max(40).allow('', null).messages({
    'string.max': 'El SKU no puede exceder 40 caracteres'
  }),
  codigo_barras: Joi.string().max(64).allow('', null).messages({
    'string.max': 'El código de barras no puede exceder 64 caracteres'
  }),
  id_categoria: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID de la categoría debe ser un número',
    'number.integer': 'El ID de la categoría debe ser un número entero',
    'number.positive': 'El ID de la categoría debe ser positivo',
    'any.required': 'La categoría es requerida'
  }),
  id_marca: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID de la marca debe ser un número',
    'number.integer': 'El ID de la marca debe ser un número entero',
    'number.positive': 'El ID de la marca debe ser positivo',
    'any.required': 'La marca es requerida'
  }),
  precio_unitario: Joi.number().min(0).precision(2).default(0.00).messages({
    'number.min': 'El precio unitario no puede ser negativo',
    'number.precision': 'El precio unitario debe tener máximo 2 decimales'
  }),
  stock: Joi.number().integer().min(0).default(0).messages({
    'number.integer': 'El stock debe ser un número entero',
    'number.min': 'El stock no puede ser negativo'
  }),
  fecha_vencimiento: Joi.date().min('now').allow(null).messages({
    'date.min': 'La fecha de vencimiento no puede ser anterior a hoy'
  }),
  activo: Joi.boolean().default(true).messages({
    'boolean.base': 'El estado activo debe ser verdadero o falso'
  })
});

const esquemaActualizarProducto = Joi.object({
  nombre: Joi.string().min(2).max(140).messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 140 caracteres'
  }),
  descripcion: Joi.string().max(500).allow('', null).messages({
    'string.max': 'La descripción no puede exceder 500 caracteres'
  }),
  sku: Joi.string().max(40).allow('', null).messages({
    'string.max': 'El SKU no puede exceder 40 caracteres'
  }),
  codigo_barras: Joi.string().max(64).allow('', null).messages({
    'string.max': 'El código de barras no puede exceder 64 caracteres'
  }),
  id_categoria: Joi.number().integer().positive().messages({
    'number.base': 'El ID de la categoría debe ser un número',
    'number.integer': 'El ID de la categoría debe ser un número entero',
    'number.positive': 'El ID de la categoría debe ser positivo'
  }),
  id_marca: Joi.number().integer().positive().messages({
    'number.base': 'El ID de la marca debe ser un número',
    'number.integer': 'El ID de la marca debe ser un número entero',
    'number.positive': 'El ID de la marca debe ser positivo'
  }),
  precio_unitario: Joi.number().min(0).precision(2).messages({
    'number.min': 'El precio unitario no puede ser negativo',
    'number.precision': 'El precio unitario debe tener máximo 2 decimales'
  }),
  stock: Joi.number().integer().min(0).messages({
    'number.integer': 'El stock debe ser un número entero',
    'number.min': 'El stock no puede ser negativo'
  }),
  fecha_vencimiento: Joi.date().min('now').allow(null).messages({
    'date.min': 'La fecha de vencimiento no puede ser anterior a hoy'
  }),
  activo: Joi.boolean().messages({
    'boolean.base': 'El estado activo debe ser verdadero o falso'
  })
});

class ProductoController {
  // Crear nuevo producto
  static async crear(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = esquemaCrearProducto.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Crear producto
      const producto = await ProductoModel.crear(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Producto creado correctamente',
        datos: {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          sku: producto.sku,
          codigo_barras: producto.codigo_barras,
          id_categoria: producto.id_categoria,
          precio_unitario: producto.precio_unitario,
          stock: producto.stock,
          fecha_vencimiento: producto.fecha_vencimiento,
          activo: producto.activo,
          created_at: producto.created_at,
          updated_at: producto.updated_at
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los productos con paginación y filtros
  static async obtenerTodos(req, res, next) {
    try {
      const { pagina, limite, activo, id_categoria, busqueda } = req.query;
      
      // Validar parámetros de paginación
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      // Construir filtros
      const filtros = {};
      if (activo !== undefined) filtros.activo = activo;
      if (id_categoria) filtros.id_categoria = parseInt(id_categoria);
      if (busqueda) filtros.busqueda = busqueda;
      
      // Obtener productos
      const resultado = await ProductoModel.obtenerTodos(filtros, paginacion);
      
      // Construir respuesta paginada
      const respuesta = construirRespuestaPaginada(
        resultado.productos,
        resultado.total,
        paginacionValida.pagina,
        paginacionValida.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Productos obtenidos correctamente',
        datos: respuesta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener producto por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id_producto } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_producto);
      if (isNaN(id)) {
        throw crearError('ID de producto inválido', 400);
      }
      
      // Obtener producto
      const producto = await ProductoModel.obtenerPorId(id);
      
      res.json({
        ok: true,
        mensaje: 'Producto obtenido correctamente',
        datos: {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          sku: producto.sku,
          codigo_barras: producto.codigo_barras,
          id_categoria: producto.id_categoria,
          categoria_nombre: producto.categoria_nombre,
          precio_unitario: producto.precio_unitario,
          stock: producto.stock,
          fecha_vencimiento: producto.fecha_vencimiento,
          activo: producto.activo,
          created_at: producto.created_at,
          updated_at: producto.updated_at
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Actualizar producto
  static async actualizar(req, res, next) {
    try {
      const { id_producto } = req.params;
      const datosActualizacion = req.body;
      
      // Validar que el ID sea un número
      const id = parseInt(id_producto);
      if (isNaN(id)) {
        throw crearError('ID de producto inválido', 400);
      }
      
      // Validar datos de entrada
      const { error, value } = esquemaActualizarProducto.validate(datosActualizacion);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Actualizar producto
      const producto = await ProductoModel.actualizar(id, value);
      
      res.json({
        ok: true,
        mensaje: 'Producto actualizado correctamente',
        datos: {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          sku: producto.sku,
          codigo_barras: producto.codigo_barras,
          id_categoria: producto.id_categoria,
          precio_unitario: producto.precio_unitario,
          stock: producto.stock,
          fecha_vencimiento: producto.fecha_vencimiento,
          activo: producto.activo,
          created_at: producto.created_at,
          updated_at: producto.updated_at
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Eliminar producto
  static async eliminar(req, res, next) {
    try {
      const { id_producto } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_producto);
      if (isNaN(id)) {
        throw crearError('ID de producto inválido', 400);
      }
      
      // Eliminar producto
      const resultado = await ProductoModel.eliminar(id);
      
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas de productos
  static async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await ProductoModel.obtenerEstadisticas();
      
      res.json({
        ok: true,
        mensaje: 'Estadísticas obtenidas correctamente',
        datos: estadisticas
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener productos por rango de fechas
  static async obtenerPorRangoFechas(req, res, next) {
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
      
      const productos = await ProductoModel.obtenerPorRangoFechas(desde, hasta);
      
      res.json({
        ok: true,
        mensaje: 'Productos obtenidos correctamente',
        datos: productos
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductoController;
