const { extraerToken, verificarToken } = require('../utils/jwt');
const { crearError } = require('../utils/errorHandler');
const { pool } = require('../config/db');

// Middleware para verificar autenticación
const verificarAutenticacion = async (req, res, next) => {
  try {
    const token = extraerToken(req);
    const datosToken = verificarToken(token);
    
    // Verificar que el usuario existe en la base de datos
    const cliente = await pool.connect();
    const resultado = await cliente.query(
      `SELECT u.id_usuario, u.correo, u.estado, r.nombre as rol
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id_rol
       WHERE u.id_usuario = $1 AND u.estado = 'ACTIVO'`,
      [datosToken.id_usuario]
    );
    cliente.release();
    
    if (resultado.rows.length === 0) {
      throw crearError('Usuario no encontrado o inactivo', 401);
    }
    
    const usuario = resultado.rows[0];
    req.usuario = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar rol específico
const requiereRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return next(crearError('Autenticación requerida', 401));
    }
    
    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
    
    if (!roles.includes(req.usuario.rol)) {
      return next(crearError('No tienes permisos para realizar esta acción', 403));
    }
    
    next();
  };
};

// Middleware para verificar que el usuario puede acceder a sus propios datos
const puedeAccederUsuario = (req, res, next) => {
  const idUsuarioSolicitado = parseInt(req.params.id_usuario);
  
  if (!req.usuario) {
    return next(crearError('Autenticación requerida', 401));
  }
  
  // Los administradores pueden acceder a cualquier usuario
  if (req.usuario.rol === 'ADMIN') {
    return next();
  }
  
  // Los usuarios solo pueden acceder a sus propios datos
  if (req.usuario.id_usuario !== idUsuarioSolicitado) {
    return next(crearError('No tienes permisos para acceder a estos datos', 403));
  }
  
  next();
};

// Middleware para verificar que el usuario puede modificar sus propios datos
const puedeModificarUsuario = (req, res, next) => {
  const idUsuarioSolicitado = parseInt(req.params.id_usuario);
  
  if (!req.usuario) {
    return next(crearError('Autenticación requerida', 401));
  }
  
  // Los administradores pueden modificar cualquier usuario
  if (req.usuario.rol === 'ADMIN') {
    return next();
  }
  
  // Los usuarios solo pueden modificar sus propios datos
  if (req.usuario.id_usuario !== idUsuarioSolicitado) {
    return next(crearError('No tienes permisos para modificar estos datos', 403));
  }
  
  // Los usuarios no pueden cambiar su rol ni estado
  if (req.body.rol_id || req.body.estado) {
    return next(crearError('No puedes cambiar tu rol o estado', 403));
  }
  
  next();
};

module.exports = {
  verificarAutenticacion,
  requiereRol,
  puedeAccederUsuario,
  puedeModificarUsuario
};
