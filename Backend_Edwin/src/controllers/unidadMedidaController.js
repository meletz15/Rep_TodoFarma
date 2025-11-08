const Joi = require('joi');
const UnidadMedidaModel = require('../models/unidadMedidaModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaCrearUnidadMedida = Joi.object({
  nombre: Joi.string().min(2).max(20).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 20 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  simbolo: Joi.string().min(1).max(10).required().messages({
    'string.min': 'El símbolo debe tener al menos 1 carácter',
    'string.max': 'El símbolo no puede exceder 10 caracteres',
    'any.required': 'El símbolo es requerido'
  }),
  descripcion: Joi.string().max(255).allow('', null).messages({
    'string.max': 'La descripción no puede exceder 255 caracteres'
  }),
  activo: Joi.boolean().default(true).messages({
    'boolean.base': 'El estado activo debe ser verdadero o falso'
  })
});

const esquemaActualizarUnidadMedida = Joi.object({
  nombre: Joi.string().min(2).max(20).messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 20 caracteres'
  }),
  simbolo: Joi.string().min(1).max(10).messages({
    'string.min': 'El símbolo debe tener al menos 1 carácter',
    'string.max': 'El símbolo no puede exceder 10 caracteres'
  }),
  descripcion: Joi.string().max(255).allow('', null).messages({
    'string.max': 'La descripción no puede exceder 255 caracteres'
  }),
  activo: Joi.boolean().messages({
    'boolean.base': 'El estado activo debe ser verdadero o falso'
  })
});

class UnidadMedidaController {
  // Crear nueva unidad de medida
  static async crear(req, res, next) {
    try {
      const { error, value } = esquemaCrearUnidadMedida.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      const unidadMedida = await UnidadMedidaModel.crear(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Unidad de medida creada correctamente',
        datos: unidadMedida
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener unidad de medida por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de unidad de medida inválido'
        });
      }
      
      const unidadMedida = await UnidadMedidaModel.obtenerPorId(parseInt(id));
      
      res.json({
        ok: true,
        mensaje: 'Unidad de medida obtenida correctamente',
        datos: unidadMedida
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las unidades de medida
  static async obtenerTodas(req, res, next) {
    try {
      const { pagina, limite, activo, busqueda } = req.query;
      
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      const filtros = {
        activo: activo || '',
        busqueda: busqueda || ''
      };
      
      const resultado = await UnidadMedidaModel.obtenerTodas(filtros, paginacion);
      
      const respuesta = construirRespuestaPaginada(
        resultado.unidadesMedida,
        resultado.total,
        paginacion.pagina,
        paginacion.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Unidades de medida obtenidas correctamente',
        datos: respuesta
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener unidades de medida activas
  static async obtenerActivas(req, res, next) {
    try {
      const unidadesMedida = await UnidadMedidaModel.obtenerActivas();
      
      res.json({
        ok: true,
        mensaje: 'Unidades de medida activas obtenidas correctamente',
        datos: unidadesMedida
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar unidad de medida
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de unidad de medida inválido'
        });
      }
      
      const { error, value } = esquemaActualizarUnidadMedida.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      const unidadMedida = await UnidadMedidaModel.actualizar(parseInt(id), value);
      
      res.json({
        ok: true,
        mensaje: 'Unidad de medida actualizada correctamente',
        datos: unidadMedida
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar unidad de medida
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de unidad de medida inválido'
        });
      }
      
      await UnidadMedidaModel.eliminar(parseInt(id));
      
      res.json({
        ok: true,
        mensaje: 'Unidad de medida eliminada correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UnidadMedidaController;

