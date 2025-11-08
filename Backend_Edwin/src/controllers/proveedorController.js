const Joi = require('joi');
const ProveedorModel = require('../models/proveedorModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');
require('dotenv').config();


// Esquemas de validación con mensajes personalizados
const esquemaCrearProveedor = Joi.object({
  nombre: Joi.string().min(2).max(80).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 80 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  apellido: Joi.string().min(2).max(80).required().messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede exceder 80 caracteres',
    'any.required': 'El apellido es requerido'
  }),
  direccion: Joi.string().optional().messages({
    'string.base': 'La dirección debe ser un texto válido'
  }),
  telefono: Joi.string().optional().messages({
    'string.base': 'El teléfono debe ser un texto válido'
  }),
  correo: Joi.string().email().required().messages({
    'string.email': 'El correo debe ser un email válido',
    'any.required': 'El correo es requerido'
  }),
  empresa: Joi.string().optional().messages({
    'string.base': 'El nombre de la empresa debe ser un texto válido'
  }),
  estado: Joi.string().valid('ACTIVO', 'INACTIVO').default('ACTIVO').messages({
    'any.only': 'El estado debe ser ACTIVO o INACTIVO'
  })
});

const esquemaActualizarProveedor = Joi.object({
  nombre: Joi.string().min(2).max(80).messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 80 caracteres'
  }),
  apellido: Joi.string().min(2).max(80).messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede exceder 80 caracteres'
  }),
  direccion: Joi.string().optional().messages({
    'string.base': 'La dirección debe ser un texto válido'
  }),
  telefono: Joi.string().optional().messages({
    'string.base': 'El teléfono debe ser un texto válido'
  }),
  correo: Joi.string().email().messages({
    'string.email': 'El correo debe ser un email válido'
  }),
  empresa: Joi.string().optional().messages({
    'string.base': 'El nombre de la empresa debe ser un texto válido'
  }),
  estado: Joi.string().valid('ACTIVO', 'INACTIVO').messages({
    'any.only': 'El estado debe ser ACTIVO o INACTIVO'
  })
});

class ProveedorController {
  // Crear nuevo proveedor
  static async crear(req, res, next) {
    try {
      const { error, value } = esquemaCrearProveedor.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }

      const proveedor = await ProveedorModel.crear(value);

      res.status(201).json({
        ok: true,
        mensaje: 'Proveedor creado correctamente',
        datos: proveedor
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los proveedores con paginación y filtros
  static async obtenerTodos(req, res, next) {
    try {
      const { pagina, limite, estado, busqueda } = req.query;

      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);

      const filtros = {};
      if (estado) filtros.estado = estado;
      if (busqueda) filtros.busqueda = busqueda;

      const resultado = await ProveedorModel.obtenerTodos(filtros, paginacion);

      const respuesta = construirRespuestaPaginada(
        resultado.proveedores,
        resultado.total,
        paginacionValida.pagina,
        paginacionValida.limite
      );

      res.json({
        ok: true,
        mensaje: 'Proveedores obtenidos correctamente',
        datos: respuesta
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener proveedor por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const idProveedor = parseInt(id);
      if (isNaN(idProveedor)) {
        throw crearError('ID de proveedor inválido', 400);
      }

      const proveedor = await ProveedorModel.obtenerPorId(idProveedor);

      res.json({
        ok: true,
        mensaje: 'Proveedor obtenido correctamente',
        datos: proveedor
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar proveedor
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const idProveedor = parseInt(id);
      if (isNaN(idProveedor)) {
        throw crearError('ID de proveedor inválido', 400);
      }

      const { error, value } = esquemaActualizarProveedor.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }

      const proveedor = await ProveedorModel.actualizar(idProveedor, value);

      res.json({
        ok: true,
        mensaje: 'Proveedor actualizado correctamente',
        datos: proveedor
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar proveedor
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const idProveedor = parseInt(id);
      if (isNaN(idProveedor)) {
        throw crearError('ID de proveedor inválido', 400);
      }

      const resultado = await ProveedorModel.eliminar(idProveedor, process.env.BORRADO_FISICO);

      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProveedorController;
