const bcrypt = require('bcrypt');
const UsuarioModel = require('../models/usuarioModel');
const { generarToken } = require('../utils/jwt');
const { crearError } = require('../utils/errorHandler');

class AuthController {
  // Login de usuario
  static async login(req, res, next) {
    try {
      const { correo, contrasena } = req.body;
      
      // Validar que se proporcionen los datos requeridos
      if (!correo || !contrasena) {
        throw crearError('Correo y contraseña son requeridos', 400);
      }
      
      // Buscar usuario por correo
      const usuario = await UsuarioModel.obtenerPorCorreo(correo);
      
      if (!usuario) {
        throw crearError('Credenciales inválidas', 401);
      }
      
      // Verificar si el usuario está activo
      if (usuario.estado !== 'ACTIVO') {
        throw crearError('Usuario inactivo', 401);
      }
      
      // Verificar contraseña
      const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
      
      if (!contrasenaValida) {
        throw crearError('Credenciales inválidas', 401);
      }
      
      // Generar token JWT
      const token = generarToken({
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.rol_nombre
      });
      
      // Respuesta exitosa
      res.json({
        ok: true,
        mensaje: 'Inicio de sesión exitoso',
        datos: {
          token,
          usuario: {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            rol: usuario.rol_nombre,
            permisos: usuario.permisos || {}
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener información del usuario autenticado
  static async obtenerPerfil(req, res, next) {
    try {
      const usuario = await UsuarioModel.obtenerPorId(req.usuario.id_usuario);
      
      res.json({
        ok: true,
        mensaje: 'Perfil obtenido correctamente',
        datos: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          rol: usuario.rol_nombre,
          estado: usuario.estado,
          fecha_registro: usuario.fecha_registro,
          permisos: usuario.permisos || {}
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Cambiar contraseña del usuario autenticado
  static async cambiarContrasena(req, res, next) {
    try {
      const { contrasena_actual, contrasena_nueva } = req.body;
      
      // Validar que se proporcionen las contraseñas
      if (!contrasena_actual || !contrasena_nueva) {
        throw crearError('Contraseña actual y nueva son requeridas', 400);
      }
      
      // Validar que la nueva contraseña sea diferente
      if (contrasena_actual === contrasena_nueva) {
        throw crearError('La nueva contraseña debe ser diferente a la actual', 400);
      }
      
      // Validar formato de la nueva contraseña
      const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!regexContrasena.test(contrasena_nueva)) {
        throw crearError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo', 400);
      }
      
      // Cambiar contraseña
      const resultado = await UsuarioModel.cambiarContrasena(
        req.usuario.id_usuario,
        contrasena_actual,
        contrasena_nueva
      );
      
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
