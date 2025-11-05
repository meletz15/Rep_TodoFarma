const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');
const bcrypt = require('bcrypt');

class UsuarioModel {
  // Crear nuevo usuario
  static async crear(datosUsuario) {
    const cliente = await pool.connect();
    try {
      // Verificar que el correo no exista
      const correoExiste = await cliente.query(
        'SELECT 1 FROM usuarios WHERE correo = $1',
        [datosUsuario.correo]
      );
      
      if (correoExiste.rows.length > 0) {
        throw crearError('El correo ya está registrado', 400);
      }
      
      // Hash de la contraseña
      const contrasenaHash = await bcrypt.hash(datosUsuario.contrasena, 10);
      
      const resultado = await cliente.query(
        `INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol_id, estado)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id_usuario, nombre, apellido, correo, rol_id, estado, fecha_registro`,
        [
          datosUsuario.nombre,
          datosUsuario.apellido,
          datosUsuario.correo,
          contrasenaHash,
          datosUsuario.rol_id,
          datosUsuario.estado || 'ACTIVO'
        ]
      );
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener usuario por ID
  static async obtenerPorId(idUsuario) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.rol_id, u.estado, u.fecha_registro,
                r.nombre as rol_nombre
         FROM usuarios u
         JOIN roles r ON u.rol_id = r.id_rol
         WHERE u.id_usuario = $1`,
        [idUsuario]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Usuario no encontrado', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener usuario por correo (para autenticación)
  static async obtenerPorCorreo(correo) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.contrasena_hash, u.rol_id, u.estado,
                r.nombre as rol_nombre
         FROM usuarios u
         JOIN roles r ON u.rol_id = r.id_rol
         WHERE u.correo = $1`,
        [correo]
      );
      
      return resultado.rows[0] || null;
    } finally {
      cliente.release();
    }
  }

  // Obtener usuarios con paginación y filtros
  static async obtenerTodos(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.rol_id, u.estado, u.fecha_registro,
               r.nombre as rol_nombre
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id_rol
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Aplicar filtros
      if (filtros.rol_id) {
        consulta += ` AND u.rol_id = $${contadorParametros}`;
        parametros.push(filtros.rol_id);
        contadorParametros++;
      }
      
      if (filtros.estado) {
        consulta += ` AND u.estado = $${contadorParametros}`;
        parametros.push(filtros.estado);
        contadorParametros++;
      }
      
      if (filtros.busqueda) {
        consulta += ` AND (LOWER(u.nombre) LIKE $${contadorParametros} OR LOWER(u.apellido) LIKE $${contadorParametros} OR LOWER(u.correo) LIKE $${contadorParametros})`;
        parametros.push(`%${filtros.busqueda.toLowerCase()}%`);
        contadorParametros++;
      }
      
      // Contar total de registros
      // Construir consulta de conteo correctamente (el regex debe manejar múltiples líneas)
      const consultaCount = consulta.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const resultadoCount = await cliente.query(consultaCount, parametros);
      const total = parseInt(resultadoCount.rows[0]?.total || 0);
      
      // Aplicar paginación
      consulta += ` ORDER BY u.fecha_registro DESC`;
      if (paginacion.limite) {
        consulta += ` LIMIT $${contadorParametros}`;
        parametros.push(paginacion.limite);
        contadorParametros++;
      }
      
      if (paginacion.offset) {
        consulta += ` OFFSET $${contadorParametros}`;
        parametros.push(paginacion.offset);
      }
      
      const resultado = await cliente.query(consulta, parametros);
      
      return {
        usuarios: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Actualizar usuario
  static async actualizar(idUsuario, datosActualizacion) {
    const cliente = await pool.connect();
    try {
      // Verificar que el usuario existe
      const usuarioExiste = await cliente.query(
        'SELECT 1 FROM usuarios WHERE id_usuario = $1',
        [idUsuario]
      );
      
      if (usuarioExiste.rows.length === 0) {
        throw crearError('Usuario no encontrado', 404);
      }
      
      // Verificar que el correo no esté en uso por otro usuario
      if (datosActualizacion.correo) {
        const correoExiste = await cliente.query(
          'SELECT 1 FROM usuarios WHERE correo = $1 AND id_usuario != $2',
          [datosActualizacion.correo, idUsuario]
        );
        
        if (correoExiste.rows.length > 0) {
          throw crearError('El correo ya está en uso por otro usuario', 400);
        }
      }
      
      // Construir consulta de actualización
      const camposActualizables = ['nombre', 'apellido', 'correo', 'rol_id', 'estado'];
      const camposParaActualizar = [];
      const valores = [];
      let contadorParametros = 1;
      
      camposActualizables.forEach(campo => {
        if (datosActualizacion[campo] !== undefined) {
          camposParaActualizar.push(`${campo} = $${contadorParametros}`);
          valores.push(datosActualizacion[campo]);
          contadorParametros++;
        }
      });
      
      if (camposParaActualizar.length === 0) {
        throw crearError('No hay campos para actualizar', 400);
      }
      
      valores.push(idUsuario);
      
      const consulta = `
        UPDATE usuarios 
        SET ${camposParaActualizar.join(', ')}
        WHERE id_usuario = $${contadorParametros}
        RETURNING id_usuario, nombre, apellido, correo, rol_id, estado, fecha_registro
      `;
      
      const resultado = await cliente.query(consulta, valores);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Cambiar contraseña
  static async cambiarContrasena(idUsuario, contrasenaActual, contrasenaNueva) {
    const cliente = await pool.connect();
    try {
      // Obtener usuario actual
      const resultado = await cliente.query(
        'SELECT contrasena_hash FROM usuarios WHERE id_usuario = $1',
        [idUsuario]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Usuario no encontrado', 404);
      }
      
      // Verificar contraseña actual
      const contrasenaValida = await bcrypt.compare(contrasenaActual, resultado.rows[0].contrasena_hash);
      if (!contrasenaValida) {
        throw crearError('Contraseña actual incorrecta', 400);
      }
      
      // Hash de la nueva contraseña
      const contrasenaHash = await bcrypt.hash(contrasenaNueva, 10);
      
      // Actualizar contraseña
      await cliente.query(
        'UPDATE usuarios SET contrasena_hash = $1 WHERE id_usuario = $2',
        [contrasenaHash, idUsuario]
      );
      
      return { mensaje: 'Contraseña actualizada correctamente' };
    } finally {
      cliente.release();
    }
  }

  // Eliminar usuario (lógico o físico)
  static async eliminar(idUsuario, borradoFisico = false) {
    const cliente = await pool.connect();
    try {
      if (borradoFisico) {
        const resultado = await cliente.query(
          'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario',
          [idUsuario]
        );
        
        if (resultado.rows.length === 0) {
          throw crearError('Usuario no encontrado', 404);
        }
      } else {
        const resultado = await cliente.query(
          'UPDATE usuarios SET estado = \'INACTIVO\' WHERE id_usuario = $1 RETURNING id_usuario',
          [idUsuario]
        );
        
        if (resultado.rows.length === 0) {
          throw crearError('Usuario no encontrado', 404);
        }
      }
      
      return { mensaje: 'Usuario eliminado correctamente' };
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas de usuarios
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT 
          COUNT(*) as total_usuarios,
          COUNT(CASE WHEN estado = 'ACTIVO' THEN 1 END) as usuarios_activos,
          COUNT(CASE WHEN estado = 'INACTIVO' THEN 1 END) as usuarios_inactivos,
          COUNT(CASE WHEN fecha_registro >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as nuevos_ultimo_mes
        FROM usuarios
      `);
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener usuarios por rango de fechas
  static async obtenerPorRangoFechas(desde, hasta) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.estado, u.fecha_registro,
                r.nombre as rol_nombre
         FROM usuarios u
         JOIN roles r ON u.rol_id = r.id_rol
         WHERE u.fecha_registro >= $1 AND u.fecha_registro <= $2
         ORDER BY u.fecha_registro DESC`,
        [desde, hasta]
      );
      
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }
}

module.exports = UsuarioModel;
