const MarcaModel = require('../models/marcaModel');
const { ErrorAplicacion } = require('../utils/errorHandler');
const Joi = require('joi');

// Esquemas de validación
const esquemaCrearMarca = Joi.object({
  nombre: Joi.string().trim().min(2).max(120).required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 120 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  descripcion: Joi.string().trim().max(255).allow('', null)
    .messages({
      'string.max': 'La descripción no puede exceder 255 caracteres'
    }),
  activo: Joi.boolean().default(true)
});

const esquemaActualizarMarca = Joi.object({
  nombre: Joi.string().trim().min(2).max(120)
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 120 caracteres'
    }),
  descripcion: Joi.string().trim().max(255).allow('', null)
    .messages({
      'string.max': 'La descripción no puede exceder 255 caracteres'
    }),
  activo: Joi.boolean()
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

const esquemaFiltros = Joi.object({
  activo: Joi.string().valid('true', 'false', '').default(''),
  busqueda: Joi.string().trim().max(100).allow('', null),
  pagina: Joi.number().integer().min(1).optional(),
  limite: Joi.number().integer().min(1).max(100).optional()
});

class MarcaController {
  // Obtener todas las marcas con paginación y filtros
  static async obtenerTodas(req, res, next) {
    try {
      const { pagina = 1, limite = 10 } = req.query;
      const filtros = req.query;

      // Validar parámetros de paginación
      const paginaNum = Math.max(1, parseInt(pagina) || 1);
      const limiteNum = Math.min(100, Math.max(1, parseInt(limite) || 10));

      // Validar filtros
      const { error: errorFiltros, value: filtrosValidados } = esquemaFiltros.validate(filtros);
      if (errorFiltros) {
        throw new ErrorAplicacion(`Filtros inválidos: ${errorFiltros.details[0].message}`, 400);
      }

      const resultado = await MarcaModel.obtenerTodas(paginaNum, limiteNum, filtrosValidados);

      res.json({
        exito: true,
        mensaje: 'Marcas obtenidas exitosamente',
        datos: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener marca por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const idNum = parseInt(id);

      if (isNaN(idNum) || idNum <= 0) {
        throw new ErrorAplicacion('ID de marca inválido', 400);
      }

      const marca = await MarcaModel.obtenerPorId(idNum);

      if (!marca) {
        throw new ErrorAplicacion('Marca no encontrada', 404);
      }

      res.json({
        exito: true,
        mensaje: 'Marca obtenida exitosamente',
        datos: marca
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nueva marca
  static async crear(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value: datosValidados } = esquemaCrearMarca.validate(req.body);
      if (error) {
        throw new ErrorAplicacion(`Datos inválidos: ${error.details[0].message}`, 400);
      }

      // Verificar si ya existe una marca con el mismo nombre
      const existe = await MarcaModel.existePorNombre(datosValidados.nombre);
      if (existe) {
        throw new ErrorAplicacion('Ya existe una marca con ese nombre', 409);
      }

      const nuevaMarca = await MarcaModel.crear(datosValidados);

      res.status(201).json({
        exito: true,
        mensaje: 'Marca creada exitosamente',
        datos: nuevaMarca
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar marca
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const idNum = parseInt(id);

      if (isNaN(idNum) || idNum <= 0) {
        throw new ErrorAplicacion('ID de marca inválido', 400);
      }

      // Validar datos de entrada
      const { error, value: datosValidados } = esquemaActualizarMarca.validate(req.body);
      if (error) {
        throw new ErrorAplicacion(`Datos inválidos: ${error.details[0].message}`, 400);
      }

      // Verificar si la marca existe
      const marcaExistente = await MarcaModel.obtenerPorId(idNum);
      if (!marcaExistente) {
        throw new ErrorAplicacion('Marca no encontrada', 404);
      }

      // Si se está actualizando el nombre, verificar que no exista otra marca con el mismo nombre
      if (datosValidados.nombre) {
        const existe = await MarcaModel.existePorNombre(datosValidados.nombre, idNum);
        if (existe) {
          throw new ErrorAplicacion('Ya existe otra marca con ese nombre', 409);
        }
      }

      const marcaActualizada = await MarcaModel.actualizar(idNum, datosValidados);

      res.json({
        exito: true,
        mensaje: 'Marca actualizada exitosamente',
        datos: marcaActualizada
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar marca (soft delete)
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const idNum = parseInt(id);

      if (isNaN(idNum) || idNum <= 0) {
        throw new ErrorAplicacion('ID de marca inválido', 400);
      }

      // Verificar si la marca existe
      const marcaExistente = await MarcaModel.obtenerPorId(idNum);
      if (!marcaExistente) {
        throw new ErrorAplicacion('Marca no encontrada', 404);
      }

      await MarcaModel.eliminar(idNum);

      res.json({
        exito: true,
        mensaje: 'Marca eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener marcas activas para dropdown
  static async obtenerActivas(req, res, next) {
    try {
      const marcas = await MarcaModel.obtenerActivas();

      res.json({
        exito: true,
        mensaje: 'Marcas activas obtenidas exitosamente',
        datos: marcas
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MarcaController;
