const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class RolModel {
  // Obtener todos los roles activos
  static async obtenerTodos() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT id_rol, nombre, descripcion, activo, fecha_creacion FROM roles WHERE activo = true ORDER BY nombre'
      );
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
        'SELECT id_rol, nombre, descripcion, activo, fecha_creacion FROM roles WHERE id_rol = $1',
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
        'SELECT id_rol, nombre, descripcion, activo, fecha_creacion FROM roles WHERE nombre = $1',
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
        'SELECT 1 FROM roles WHERE id_rol = $1 AND activo = true',
        [idRol]
      );
      return resultado.rows.length > 0;
    } finally {
      cliente.release();
    }
  }
}

module.exports = RolModel;
