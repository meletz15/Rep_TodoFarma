const Joi = require('joi');
const RolModel = require('../models/rolModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaCrearRol = Joi.object({
  nombre: Joi.string().min(2).max(50).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 50 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  descripcion: Joi.string().max(255).allow(null, '').messages({
    'string.max': 'La descripción no puede exceder 255 caracteres'
  }),
  activo: Joi.boolean().default(true),
  permisos: Joi.object().pattern(
    Joi.string(),
    Joi.boolean()
  ).default({}).messages({
    'object.base': 'Los permisos deben ser un objeto JSON válido'
  })
});

const esquemaActualizarRol = Joi.object({
  nombre: Joi.string().min(2).max(50).messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 50 caracteres'
  }),
  descripcion: Joi.string().max(255).allow(null, '').messages({
    'string.max': 'La descripción no puede exceder 255 caracteres'
  }),
  activo: Joi.boolean(),
  permisos: Joi.object().pattern(
    Joi.string(),
    Joi.boolean()
  ).messages({
    'object.base': 'Los permisos deben ser un objeto JSON válido'
  })
});

class RolController {
  // Obtener todos los roles
  static async obtenerTodos(req, res, next) {
    try {
      const { activos } = req.query;
      const soloActivos = activos === 'true';

      const roles = await RolModel.obtenerTodos(soloActivos);

      // Parsear permisos JSON si existen
      const rolesConPermisos = roles.map(rol => ({
        ...rol,
        permisos: typeof rol.permisos === 'string' ? JSON.parse(rol.permisos) : (rol.permisos || {})
      }));

      res.json({
        ok: true,
        mensaje: 'Roles obtenidos correctamente',
        datos: rolesConPermisos
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener rol por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const idRol = parseInt(id);

      if (isNaN(idRol)) {
        throw crearError('ID de rol inválido', 400);
      }

      const rol = await RolModel.obtenerPorId(idRol);

      // Parsear permisos JSON si existen
      rol.permisos = typeof rol.permisos === 'string' ? JSON.parse(rol.permisos) : (rol.permisos || {});

      res.json({
        ok: true,
        mensaje: 'Rol obtenido correctamente',
        datos: rol
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nuevo rol
  static async crear(req, res, next) {
    try {
      const { error, value } = esquemaCrearRol.validate(req.body);

      if (error) {
        throw crearError(error.details[0].message, 400);
      }

      // Asegurar que siempre tenga el permiso de dashboard
      if (!value.permisos) {
        value.permisos = {};
      }
      // Si no se especifica dashboard, asignarlo por defecto
      if (value.permisos.dashboard === undefined) {
        value.permisos.dashboard = true;
      }

      const nuevoRol = await RolModel.crear(value);

      // Parsear permisos JSON
      nuevoRol.permisos = typeof nuevoRol.permisos === 'string' ? JSON.parse(nuevoRol.permisos) : (nuevoRol.permisos || {});

      res.status(201).json({
        ok: true,
        mensaje: 'Rol creado correctamente',
        datos: nuevoRol
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar rol
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const idRol = parseInt(id);

      if (isNaN(idRol)) {
        throw crearError('ID de rol inválido', 400);
      }

      const { error, value } = esquemaActualizarRol.validate(req.body);

      if (error) {
        throw crearError(error.details[0].message, 400);
      }

      // Si se están actualizando permisos, asegurar que dashboard esté presente
      if (value.permisos !== undefined) {
        // Si no se especifica dashboard en la actualización, asignarlo como true por defecto
        if (value.permisos.dashboard === undefined) {
          value.permisos.dashboard = true;
        }
      }

      const rolActualizado = await RolModel.actualizar(idRol, value);

      // Parsear permisos JSON
      rolActualizado.permisos = typeof rolActualizado.permisos === 'string' ? JSON.parse(rolActualizado.permisos) : (rolActualizado.permisos || {});

      res.json({
        ok: true,
        mensaje: 'Rol actualizado correctamente',
        datos: rolActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar rol
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const idRol = parseInt(id);

      if (isNaN(idRol)) {
        throw crearError('ID de rol inválido', 400);
      }

      await RolModel.eliminar(idRol);

      res.json({
        ok: true,
        mensaje: 'Rol eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RolController;

