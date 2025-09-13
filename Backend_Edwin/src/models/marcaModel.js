const { pool } = require('../config/db');

class MarcaModel {
  // Obtener todas las marcas con paginación y filtros
  static async obtenerTodas(pagina = 1, limite = 10, filtros = {}) {
    const offset = (pagina - 1) * limite;
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filtro por estado activo
    if (filtros.activo !== undefined && filtros.activo !== '') {
      paramCount++;
      whereClause += ` AND activo = $${paramCount}`;
      params.push(filtros.activo === 'true');
    }

    // Filtro por búsqueda (nombre)
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      paramCount++;
      whereClause += ` AND nombre ILIKE $${paramCount}`;
      params.push(`%${filtros.busqueda.trim()}%`);
    }

    // Consulta principal
    const query = `
      SELECT 
        id_marca,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM marca 
      ${whereClause}
      ORDER BY nombre ASC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limite, offset);

    // Consulta para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM marca 
      ${whereClause}
    `;

    try {
      const [resultado, resultadoCount] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, params.slice(0, -2)) // Excluir LIMIT y OFFSET
      ]);

      const total = parseInt(resultadoCount.rows[0]?.total || 0);
      const totalPaginas = Math.ceil(total / limite);

      return {
        datos: resultado.rows,
        paginacion: {
          pagina,
          limite,
          total,
          totalPaginas,
          tieneSiguiente: pagina < totalPaginas,
          tieneAnterior: pagina > 1
        }
      };
    } catch (error) {
      console.error('Error en MarcaModel.obtenerTodas:', error);
      throw error;
    }
  }

  // Obtener marca por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        id_marca,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM marca 
      WHERE id_marca = $1
    `;

    try {
      const resultado = await pool.query(query, [id]);
      return resultado.rows[0] || null;
    } catch (error) {
      console.error('Error en MarcaModel.obtenerPorId:', error);
      throw error;
    }
  }

  // Crear nueva marca
  static async crear(datos) {
    const query = `
      INSERT INTO marca (nombre, descripcion, activo)
      VALUES ($1, $2, $3)
      RETURNING 
        id_marca,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
    `;

    try {
      const resultado = await pool.query(query, [
        datos.nombre,
        datos.descripcion || null,
        datos.activo !== undefined ? datos.activo : true
      ]);
      return resultado.rows[0];
    } catch (error) {
      console.error('Error en MarcaModel.crear:', error);
      throw error;
    }
  }

  // Actualizar marca
  static async actualizar(id, datos) {
    const campos = [];
    const valores = [];
    let paramCount = 0;

    if (datos.nombre !== undefined) {
      paramCount++;
      campos.push(`nombre = $${paramCount}`);
      valores.push(datos.nombre);
    }

    if (datos.descripcion !== undefined) {
      paramCount++;
      campos.push(`descripcion = $${paramCount}`);
      valores.push(datos.descripcion);
    }

    if (datos.activo !== undefined) {
      paramCount++;
      campos.push(`activo = $${paramCount}`);
      valores.push(datos.activo);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    paramCount++;
    valores.push(id);

    const query = `
      UPDATE marca 
      SET ${campos.join(', ')}, updated_at = NOW()
      WHERE id_marca = $${paramCount}
      RETURNING 
        id_marca,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
    `;

    try {
      const resultado = await pool.query(query, valores);
      return resultado.rows[0] || null;
    } catch (error) {
      console.error('Error en MarcaModel.actualizar:', error);
      throw error;
    }
  }

  // Eliminar marca (soft delete)
  static async eliminar(id) {
    const query = `
      UPDATE marca 
      SET activo = false, updated_at = NOW()
      WHERE id_marca = $1
      RETURNING id_marca
    `;

    try {
      const resultado = await pool.query(query, [id]);
      return resultado.rows[0] || null;
    } catch (error) {
      console.error('Error en MarcaModel.eliminar:', error);
      throw error;
    }
  }

  // Obtener marcas activas para dropdown
  static async obtenerActivas() {
    const query = `
      SELECT 
        id_marca,
        nombre
      FROM marca 
      WHERE 1=1
      ORDER BY nombre ASC
    `;

    try {
      const resultado = await pool.query(query);
      return resultado.rows;
    } catch (error) {
      console.error('Error en MarcaModel.obtenerActivas:', error);
      throw error;
    }
  }

  // Verificar si existe marca por nombre
  static async existePorNombre(nombre, excluirId = null) {
    let query = 'SELECT id_marca FROM marca WHERE nombre = $1';
    const params = [nombre];

    if (excluirId) {
      query += ' AND id_marca != $2';
      params.push(excluirId);
    }

    try {
      const resultado = await pool.query(query, params);
      return resultado.rows.length > 0;
    } catch (error) {
      console.error('Error en MarcaModel.existePorNombre:', error);
      throw error;
    }
  }
}

module.exports = MarcaModel;
