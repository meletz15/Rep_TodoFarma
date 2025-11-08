const Joi = require('joi');
const PresentacionModel = require('../models/presentacionModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaCrearPresentacion = Joi.object({
  nombre: Joi.string().min(2).max(50).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 50 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  descripcion: Joi.string().max(255).allow('', null).messages({
    'string.max': 'La descripción no puede exceder 255 caracteres'
  }),
  activo: Joi.boolean().default(true).messages({
    'boolean.base': 'El estado activo debe ser verdadero o falso'
  })
});

const esquemaActualizarPresentacion = Joi.object({
  nombre: Joi.string().min(2).max(50).messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 50 caracteres'
  }),
  descripcion: Joi.string().max(255).allow('', null).messages({
    'string.max': 'La descripción no puede exceder 255 caracteres'
  }),
  activo: Joi.boolean().messages({
    'boolean.base': 'El estado activo debe ser verdadero o falso'
  })
});

class PresentacionController {
  // Crear nueva presentación
  static async crear(req, res, next) {
    try {
      const { error, value } = esquemaCrearPresentacion.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      const presentacion = await PresentacionModel.crear(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Presentación creada correctamente',
        datos: presentacion
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener presentación por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de presentación inválido'
        });
      }
      
      const presentacion = await PresentacionModel.obtenerPorId(parseInt(id));
      
      res.json({
        ok: true,
        mensaje: 'Presentación obtenida correctamente',
        datos: presentacion
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las presentaciones
  static async obtenerTodas(req, res, next) {
    try {
      const { pagina, limite, activo, busqueda } = req.query;
      
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      const filtros = {
        activo: activo || '',
        busqueda: busqueda || ''
      };
      
      const resultado = await PresentacionModel.obtenerTodas(filtros, paginacion);
      
      const respuesta = construirRespuestaPaginada(
        resultado.presentaciones,
        resultado.total,
        paginacion.pagina,
        paginacion.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Presentaciones obtenidas correctamente',
        datos: respuesta
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener presentaciones activas
  static async obtenerActivas(req, res, next) {
    try {
      const presentaciones = await PresentacionModel.obtenerActivas();
      
      res.json({
        ok: true,
        mensaje: 'Presentaciones activas obtenidas correctamente',
        datos: presentaciones
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar presentación
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de presentación inválido'
        });
      }
      
      const { error, value } = esquemaActualizarPresentacion.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      const presentacion = await PresentacionModel.actualizar(parseInt(id), value);
      
      res.json({
        ok: true,
        mensaje: 'Presentación actualizada correctamente',
        datos: presentacion
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar presentación
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de presentación inválido'
        });
      }
      
      await PresentacionModel.eliminar(parseInt(id));
      
      res.json({
        ok: true,
        mensaje: 'Presentación eliminada correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PresentacionController;

