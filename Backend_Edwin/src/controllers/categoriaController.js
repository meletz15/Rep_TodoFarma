const Joi = require('joi');
const CategoriaModel = require('../models/categoriaModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaCrearCategoria = Joi.object({
  nombre: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  descripcion: Joi.string().max(255).allow('', null).messages({
    'string.max': 'La descripción no puede exceder 255 caracteres'
  }),
  activo: Joi.boolean().default(true).messages({
    'boolean.base': 'El estado activo debe ser verdadero o falso'
  })
});

const esquemaActualizarCategoria = Joi.object({
  nombre: Joi.string().min(2).max(100).messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres'
  }),
  descripcion: Joi.string().max(255).allow('', null).messages({
    'string.max': 'La descripción no puede exceder 255 caracteres'
  }),
  activo: Joi.boolean().messages({
    'boolean.base': 'El estado activo debe ser verdadero o falso'
  })
});

class CategoriaController {
  // Crear nueva categoría
  static async crear(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = esquemaCrearCategoria.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Crear categoría
      const categoria = await CategoriaModel.crear(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Categoría creada correctamente',
        datos: {
          id_categoria: categoria.id_categoria,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          activo: categoria.activo,
          created_at: categoria.created_at,
          updated_at: categoria.updated_at
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las categorías con paginación y filtros
  static async obtenerTodas(req, res, next) {
    try {
      const { pagina, limite, activo, busqueda } = req.query;
      
      // Validar parámetros de paginación
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      // Construir filtros
      const filtros = {};
      if (activo !== undefined) filtros.activo = activo;
      if (busqueda) filtros.busqueda = busqueda;
      
      // Obtener categorías
      const resultado = await CategoriaModel.obtenerTodas(filtros, paginacion);
      
      // Construir respuesta paginada
      const respuesta = construirRespuestaPaginada(
        resultado.categorias,
        resultado.total,
        paginacionValida.pagina,
        paginacionValida.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Categorías obtenidas correctamente',
        datos: respuesta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener categorías activas (para dropdowns)
  static async obtenerActivas(req, res, next) {
    try {
      const categorias = await CategoriaModel.obtenerActivas();
      
      res.json({
        ok: true,
        mensaje: 'Categorías activas obtenidas correctamente',
        datos: categorias
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener categoría por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id_categoria } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_categoria);
      if (isNaN(id)) {
        throw crearError('ID de categoría inválido', 400);
      }
      
      // Obtener categoría
      const categoria = await CategoriaModel.obtenerPorId(id);
      
      res.json({
        ok: true,
        mensaje: 'Categoría obtenida correctamente',
        datos: {
          id_categoria: categoria.id_categoria,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          activo: categoria.activo,
          created_at: categoria.created_at,
          updated_at: categoria.updated_at
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Actualizar categoría
  static async actualizar(req, res, next) {
    try {
      const { id_categoria } = req.params;
      const datosActualizacion = req.body;
      
      // Validar que el ID sea un número
      const id = parseInt(id_categoria);
      if (isNaN(id)) {
        throw crearError('ID de categoría inválido', 400);
      }
      
      // Validar datos de entrada
      const { error, value } = esquemaActualizarCategoria.validate(datosActualizacion);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Actualizar categoría
      const categoria = await CategoriaModel.actualizar(id, value);
      
      res.json({
        ok: true,
        mensaje: 'Categoría actualizada correctamente',
        datos: {
          id_categoria: categoria.id_categoria,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          activo: categoria.activo,
          created_at: categoria.created_at,
          updated_at: categoria.updated_at
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Eliminar categoría
  static async eliminar(req, res, next) {
    try {
      const { id_categoria } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_categoria);
      if (isNaN(id)) {
        throw crearError('ID de categoría inválido', 400);
      }
      
      // Eliminar categoría
      const resultado = await CategoriaModel.eliminar(id);
      
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas de categorías
  static async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await CategoriaModel.obtenerEstadisticas();
      
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

module.exports = CategoriaController;
