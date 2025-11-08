const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class RolModel {
  // Obtener todos los roles
  static async obtenerTodos(activos = false) {
    const cliente = await pool.connect();
    try {
      let query = 'SELECT id_rol, nombre, descripcion, activo, fecha_creacion, permisos FROM roles';
      if (activos) {
        query += ' WHERE activo = true';
      }
      query += ' ORDER BY nombre';
      
      const resultado = await cliente.query(query);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener rol por ID
  static async obtenerPorId(idRol) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT id_rol, nombre, descripcion, activo, fecha_creacion, permisos FROM roles WHERE id_rol = $1',
        [idRol]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Rol no encontrado', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener rol por nombre
  static async obtenerPorNombre(nombre) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT id_rol, nombre, descripcion, activo, fecha_creacion, permisos FROM roles WHERE nombre = $1',
        [nombre]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Rol no encontrado', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Verificar si existe un rol
  static async existe(idRol) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT 1 FROM roles WHERE id_rol = $1',
        [idRol]
      );
      return resultado.rows.length > 0;
    } finally {
      cliente.release();
    }
  }

  // Verificar si existe un rol por nombre
  static async existePorNombre(nombre, excluirId = null) {
    const cliente = await pool.connect();
    try {
      let query = 'SELECT 1 FROM roles WHERE LOWER(nombre) = LOWER($1)';
      const params = [nombre];
      
      if (excluirId) {
        query += ' AND id_rol != $2';
        params.push(excluirId);
      }
      
      const resultado = await cliente.query(query, params);
      return resultado.rows.length > 0;
    } finally {
      cliente.release();
    }
  }

  // Crear nuevo rol
  static async crear(datosRol) {
    const cliente = await pool.connect();
    try {
      // Verificar que el nombre no exista
      const nombreExiste = await RolModel.existePorNombre(datosRol.nombre);
      if (nombreExiste) {
        throw crearError('El nombre del rol ya existe', 400);
      }

      const resultado = await cliente.query(
        `INSERT INTO roles (nombre, descripcion, activo, permisos)
         VALUES ($1, $2, $3, $4)
         RETURNING id_rol, nombre, descripcion, activo, fecha_creacion, permisos`,
        [
          datosRol.nombre,
          datosRol.descripcion || null,
          datosRol.activo !== undefined ? datosRol.activo : true,
          JSON.stringify(datosRol.permisos || {})
        ]
      );
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Actualizar rol
  static async actualizar(idRol, datosRol) {
    const cliente = await pool.connect();
    try {
      // Verificar que el rol existe
      const existe = await RolModel.existe(idRol);
      if (!existe) {
        throw crearError('Rol no encontrado', 404);
      }

      // Verificar que el nombre no esté en uso por otro rol
      if (datosRol.nombre) {
        const nombreExiste = await RolModel.existePorNombre(datosRol.nombre, idRol);
        if (nombreExiste) {
          throw crearError('El nombre del rol ya está en uso', 400);
        }
      }

      const campos = [];
      const valores = [];
      let paramIndex = 1;

      if (datosRol.nombre !== undefined) {
        campos.push(`nombre = $${paramIndex++}`);
        valores.push(datosRol.nombre);
      }

      if (datosRol.descripcion !== undefined) {
        campos.push(`descripcion = $${paramIndex++}`);
        valores.push(datosRol.descripcion);
      }

      if (datosRol.activo !== undefined) {
        campos.push(`activo = $${paramIndex++}`);
        valores.push(datosRol.activo);
      }

      if (datosRol.permisos !== undefined) {
        campos.push(`permisos = $${paramIndex++}`);
        valores.push(JSON.stringify(datosRol.permisos));
      }

      if (campos.length === 0) {
        throw crearError('No hay campos para actualizar', 400);
      }

      valores.push(idRol);

      const resultado = await cliente.query(
        `UPDATE roles 
         SET ${campos.join(', ')}
         WHERE id_rol = $${paramIndex}
         RETURNING id_rol, nombre, descripcion, activo, fecha_creacion, permisos`,
        valores
      );

      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Eliminar rol
  static async eliminar(idRol) {
    const cliente = await pool.connect();
    try {
      // Verificar que el rol existe
      const existe = await RolModel.existe(idRol);
      if (!existe) {
        throw crearError('Rol no encontrado', 404);
      }

      // Verificar si hay usuarios usando este rol
      const usuariosConRol = await cliente.query(
        'SELECT COUNT(*) as total FROM usuarios WHERE rol_id = $1',
        [idRol]
      );

      if (parseInt(usuariosConRol.rows[0].total) > 0) {
        throw crearError('No se puede eliminar el rol porque hay usuarios asignados a él', 400);
      }

      await cliente.query('DELETE FROM roles WHERE id_rol = $1', [idRol]);

      return { mensaje: 'Rol eliminado correctamente' };
    } finally {
      cliente.release();
    }
  }
}

module.exports = RolModel;
