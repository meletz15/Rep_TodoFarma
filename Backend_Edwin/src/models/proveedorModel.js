const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class ProveedorModel {
  // Crear nuevo proveedor
  static async crear(datosProveedor) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `INSERT INTO proveedores (
            nombre, apellido, direccion, telefono, correo, empresa, estado
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id, nombre, apellido, direccion, telefono, correo, empresa, estado`,
        [
          datosProveedor.nombre,
          datosProveedor.apellido,
          datosProveedor.direccion || null,
          datosProveedor.telefono || null,
          datosProveedor.correo,
          datosProveedor.empresa || null,
          datosProveedor.estado || 'ACTIVO'
        ]
      );

      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener proveedor por ID
  static async obtenerPorId(id) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT id, nombre, apellido, direccion, telefono, correo, empresa, estado
         FROM proveedores
         WHERE id = $1`,
        [id]
      );

      if (resultado.rows.length === 0) {
        throw crearError('Proveedor no encontrado', 404);
      }

      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener todos los proveedores con filtros y paginación
  static async obtenerTodos(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT id, nombre, apellido, direccion, telefono, correo, empresa, estado
        FROM proveedores
        WHERE 1=1
      `;

      const parametros = [];
      let contador = 1;

      // Filtros
      if (filtros.estado) {
        consulta += ` AND estado = $${contador}`;
        parametros.push(filtros.estado);
        contador++;
      }

      if (filtros.busqueda) {
        consulta += ` AND (
          LOWER(nombre) LIKE $${contador} OR
          LOWER(apellido) LIKE $${contador} OR
          LOWER(empresa) LIKE $${contador}
        )`;
        parametros.push(`%${filtros.busqueda.toLowerCase()}%`);
        contador++;
      }

      // Conteo total
      const consultaCount = consulta.replace(/SELECT[\s\S]*FROM/, 'SELECT COUNT(*) FROM');
      const resultadoCount = await cliente.query(consultaCount, parametros);
      const total = parseInt(resultadoCount.rows[0].count);

      // Paginación
      consulta += ` ORDER BY id DESC`;
      if (paginacion.limite) {
        consulta += ` LIMIT $${contador}`;
        parametros.push(paginacion.limite);
        contador++;
      }

      if (paginacion.offset) {
        consulta += ` OFFSET $${contador}`;
        parametros.push(paginacion.offset);
      }

      const resultado = await cliente.query(consulta, parametros);

      return {
        proveedores: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Actualizar proveedor
  static async actualizar(id, datosActualizacion) {
    const cliente = await pool.connect();
    try {
      const existe = await cliente.query(
        'SELECT 1 FROM proveedores WHERE id = $1',
        [id]
      );

      if (existe.rows.length === 0) {
        throw crearError('Proveedor no encontrado', 404);
      }

      const campos = ['nombre', 'apellido', 'direccion', 'telefono', 'correo', 'empresa', 'estado'];

      const camposParaActualizar = [];
      const valores = [];
      let contador = 1;

      campos.forEach(campo => {
        if (datosActualizacion[campo] !== undefined) {
          camposParaActualizar.push(`${campo} = $${contador}`);
          valores.push(datosActualizacion[campo]);
          contador++;
        }
      });

      if (camposParaActualizar.length === 0) {
        throw crearError('No hay campos para actualizar', 400);
      }

      valores.push(id);

      const consulta = `
        UPDATE proveedores
        SET ${camposParaActualizar.join(', ')}
        WHERE id = $${contador}
        RETURNING id, nombre, apellido, direccion, telefono, correo, empresa, estado
      `;

      const resultado = await cliente.query(consulta, valores);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Eliminar proveedor (lógico o físico)
  static async eliminar(id, borradoFisico = false) {
    const cliente = await pool.connect();
    try {
      if (borradoFisico) {
        const resultado = await cliente.query(
          'DELETE FROM proveedores WHERE id = $1 RETURNING id',
          [id]
        );

        if (resultado.rows.length === 0) {
          throw crearError('Proveedor no encontrado', 404);
        }
      } else {
        const resultado = await cliente.query(
          'UPDATE proveedores SET estado = \'INACTIVO\' WHERE id = $1 RETURNING id',
          [id]
        );

        if (resultado.rows.length === 0) {
          throw crearError('Proveedor no encontrado', 404);
        }
      }

      return { mensaje: 'Proveedor eliminado correctamente' };
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas de proveedores
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT
          COUNT(*) as total_proveedores,
          COUNT(CASE WHEN estado = 'ACTIVO' THEN 1 END) as proveedores_activos,
          COUNT(CASE WHEN estado = 'INACTIVO' THEN 1 END) as proveedores_inactivos,
          COUNT(CASE WHEN fecha_registro >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as nuevos_ultimo_mes
        FROM proveedores
      `);

      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener proveedores por rango de fechas
  static async obtenerPorRangoFechas(desde, hasta) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT id, nombre, apellido, direccion, telefono, correo, empresa, estado
         FROM proveedores
         WHERE fecha_registro >= $1 AND fecha_registro <= $2
         ORDER BY fecha_registro DESC`,
        [desde, hasta]
      );

      return resultado.rows;
    } finally {
      cliente.release();
    }
  }
}

module.exports = ProveedorModel;
