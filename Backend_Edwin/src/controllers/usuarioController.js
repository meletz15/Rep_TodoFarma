const Joi = require('joi');
const UsuarioModel = require('../models/usuarioModel');
const RolModel = require('../models/rolModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');
require('dotenv').config();

// Esquemas de validación
const esquemaCrearUsuario = Joi.object({
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
  correo: Joi.string().email().max(120).required().messages({
    'string.email': 'El correo debe tener un formato válido',
    'string.max': 'El correo no puede exceder 120 caracteres',
    'any.required': 'El correo es requerido'
  }),
  contrasena: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
    'string.pattern.base': 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo',
    'any.required': 'La contraseña es requerida'
  }),
  rol_id: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del rol debe ser un número',
    'number.integer': 'El ID del rol debe ser un número entero',
    'number.positive': 'El ID del rol debe ser positivo',
    'any.required': 'El rol es requerido'
  }),
  estado: Joi.string().valid('ACTIVO', 'INACTIVO').default('ACTIVO').messages({
    'any.only': 'El estado debe ser ACTIVO o INACTIVO'
  })
});

const esquemaActualizarUsuario = Joi.object({
  nombre: Joi.string().min(2).max(80).messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 80 caracteres'
  }),
  apellido: Joi.string().min(2).max(80).messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede exceder 80 caracteres'
  }),
  correo: Joi.string().email().max(120).messages({
    'string.email': 'El correo debe tener un formato válido',
    'string.max': 'El correo no puede exceder 120 caracteres'
  }),
  contrasena: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).messages({
    'string.pattern.base': 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo'
  }),
  rol_id: Joi.number().integer().positive().messages({
    'number.base': 'El ID del rol debe ser un número',
    'number.integer': 'El ID del rol debe ser un número entero',
    'number.positive': 'El ID del rol debe ser positivo'
  }),
  estado: Joi.string().valid('ACTIVO', 'INACTIVO').messages({
    'any.only': 'El estado debe ser ACTIVO o INACTIVO'
  })
});

class UsuarioController {
  // Crear nuevo usuario
  static async crear(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = esquemaCrearUsuario.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Verificar que el rol existe
      const rolExiste = await RolModel.existe(value.rol_id);
      if (!rolExiste) {
        throw crearError('El rol especificado no existe', 400);
      }
      
      // Crear usuario
      const usuario = await UsuarioModel.crear(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Usuario creado correctamente',
        datos: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          rol_id: usuario.rol_id,
          estado: usuario.estado,
          fecha_registro: usuario.fecha_registro
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los usuarios con paginación y filtros
  static async obtenerTodos(req, res, next) {
    try {
      const { pagina, limite, rol_id, estado, busqueda } = req.query;
      
      // Validar parámetros de paginación
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      // Construir filtros
      const filtros = {};
      if (rol_id) filtros.rol_id = parseInt(rol_id);
      if (estado) filtros.estado = estado;
      if (busqueda) filtros.busqueda = busqueda;
      
      // Obtener usuarios
      const resultado = await UsuarioModel.obtenerTodos(filtros, paginacion);
      
      // Construir respuesta paginada
      const respuesta = construirRespuestaPaginada(
        resultado.usuarios,
        resultado.total,
        paginacionValida.pagina,
        paginacionValida.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Usuarios obtenidos correctamente',
        datos: respuesta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener usuario por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id_usuario } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_usuario);
      if (isNaN(id)) {
        throw crearError('ID de usuario inválido', 400);
      }
      
      // Obtener usuario
      const usuario = await UsuarioModel.obtenerPorId(id);
      
      res.json({
        ok: true,
        mensaje: 'Usuario obtenido correctamente',
        datos: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          rol_id: usuario.rol_id,
          rol_nombre: usuario.rol_nombre,
          estado: usuario.estado,
          fecha_registro: usuario.fecha_registro
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Actualizar usuario
  static async actualizar(req, res, next) {
    try {
      const { id_usuario } = req.params;
      const datosActualizacion = req.body;
      
      // Validar que el ID sea un número
      const id = parseInt(id_usuario);
      if (isNaN(id)) {
        throw crearError('ID de usuario inválido', 400);
      }
      
      // Validar datos de entrada
      const { error, value } = esquemaActualizarUsuario.validate(datosActualizacion);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Verificar que el rol existe si se está actualizando
      if (value.rol_id) {
        const rolExiste = await RolModel.existe(value.rol_id);
        if (!rolExiste) {
          throw crearError('El rol especificado no existe', 400);
        }
      }
      
      // Actualizar usuario
      const usuario = await UsuarioModel.actualizar(id, value);
      
      res.json({
        ok: true,
        mensaje: 'Usuario actualizado correctamente',
        datos: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          rol_id: usuario.rol_id,
          estado: usuario.estado,
          fecha_registro: usuario.fecha_registro
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Eliminar usuario
  static async eliminar(req, res, next) {
    try {
      const { id_usuario } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_usuario);
      if (isNaN(id)) {
        throw crearError('ID de usuario inválido', 400);
      }
      
      // Verificar que no se elimine a sí mismo
      if (id === req.usuario.id_usuario) {
        throw crearError('No puedes eliminar tu propia cuenta', 400);
      }
      
      // Eliminar usuario
      const resultado = await UsuarioModel.eliminar(id, process.env.BORRADO_FISICO);
      
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Cambiar contraseña de un usuario específico (solo ADMIN)
  static async cambiarContrasenaUsuario(req, res, next) {
    try {
      const { id_usuario } = req.params;
      const { contrasena_nueva } = req.body;
      
      // Validar que el ID sea un número
      const id = parseInt(id_usuario);
      if (isNaN(id)) {
        throw crearError('ID de usuario inválido', 400);
      }
      
      // Validar que se proporcione la nueva contraseña
      if (!contrasena_nueva) {
        throw crearError('La nueva contraseña es requerida', 400);
      }
      
      // Validar formato de la nueva contraseña
      const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!regexContrasena.test(contrasena_nueva)) {
        throw crearError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo', 400);
      }
      
      // Cambiar contraseña (sin verificar contraseña actual para admin)
      const bcrypt = require('bcrypt');
      const contrasenaHash = await bcrypt.hash(contrasena_nueva, 10);
      
      const { pool } = require('../config/db');
      const cliente = await pool.connect();
      try {
        await cliente.query(
          'UPDATE usuarios SET contrasena_hash = $1 WHERE id_usuario = $2',
          [contrasenaHash, id]
        );
      } finally {
        cliente.release();
      }
      
      res.json({
        ok: true,
        mensaje: 'Contraseña actualizada correctamente'
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsuarioController;
