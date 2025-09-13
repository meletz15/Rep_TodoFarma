const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class CategoriaModel {
  // Crear nueva categoría
  static async crear(datosCategoria) {
    const cliente = await pool.connect();
    try {
      // Verificar que el nombre no exista
      const nombreExiste = await cliente.query(
        'SELECT 1 FROM categoria WHERE LOWER(nombre) = LOWER($1)',
        [datosCategoria.nombre]
      );
      
      if (nombreExiste.rows.length > 0) {
        throw crearError('El nombre de la categoría ya existe', 400);
      }
      
      const resultado = await cliente.query(
        `INSERT INTO categoria (nombre, descripcion, activo)
         VALUES ($1, $2, $3)
         RETURNING id_categoria, nombre, descripcion, activo, created_at, updated_at`,
        [
          datosCategoria.nombre,
          datosCategoria.descripcion || null,
          datosCategoria.activo !== undefined ? datosCategoria.activo : true
        ]
      );
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener categoría por ID
  static async obtenerPorId(idCategoria) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT id_categoria, nombre, descripcion, activo, created_at, updated_at
         FROM categoria
         WHERE id_categoria = $1`,
        [idCategoria]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Categoría no encontrada', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener categorías con paginación y filtros
  static async obtenerTodas(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT id_categoria, nombre, descripcion, activo, created_at, updated_at
        FROM categoria
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Aplicar filtros
      if (filtros.activo !== undefined && filtros.activo !== '') {
        consulta += ` AND activo = $${contadorParametros}`;
        parametros.push(filtros.activo === 'true');
        contadorParametros++;
      }
      
      if (filtros.busqueda) {
        consulta += ` AND (
          LOWER(nombre) LIKE $${contadorParametros} OR 
          LOWER(descripcion) LIKE $${contadorParametros}
        )`;
        parametros.push(`%${filtros.busqueda.toLowerCase()}%`);
        contadorParametros++;
      }
      
      // Contar total de registros
      const consultaCount = consulta.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
      const resultadoCount = await cliente.query(consultaCount, parametros);
      const total = parseInt(resultadoCount.rows[0]?.total || 0);
      
      // Aplicar paginación
      consulta += ` ORDER BY created_at DESC`;
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
        categorias: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Obtener todas las categorías activas (para dropdowns)
  static async obtenerActivas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT id_categoria, nombre, descripcion
         FROM categoria
         WHERE activo = true
         ORDER BY nombre ASC`
      );
      
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Actualizar categoría
  static async actualizar(idCategoria, datosActualizacion) {
    const cliente = await pool.connect();
    try {
      // Verificar que la categoría existe
      const categoriaExiste = await cliente.query(
        'SELECT 1 FROM categoria WHERE id_categoria = $1',
        [idCategoria]
      );
      
      if (categoriaExiste.rows.length === 0) {
        throw crearError('Categoría no encontrada', 404);
      }
      
      // Verificar que el nombre no esté en uso por otra categoría
      if (datosActualizacion.nombre) {
        const nombreExiste = await cliente.query(
          'SELECT 1 FROM categoria WHERE LOWER(nombre) = LOWER($1) AND id_categoria != $2',
          [datosActualizacion.nombre, idCategoria]
        );
        
        if (nombreExiste.rows.length > 0) {
          throw crearError('El nombre de la categoría ya está en uso', 400);
        }
      }
      
      // Construir consulta de actualización
      const camposActualizables = ['nombre', 'descripcion', 'activo'];
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
      
      valores.push(idCategoria);
      
      const consulta = `
        UPDATE categoria 
        SET ${camposParaActualizar.join(', ')}, updated_at = NOW()
        WHERE id_categoria = $${contadorParametros}
        RETURNING id_categoria, nombre, descripcion, activo, created_at, updated_at
      `;
      
      const resultado = await cliente.query(consulta, valores);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Eliminar categoría (soft delete)
  static async eliminar(idCategoria) {
    const cliente = await pool.connect();
    try {
      // Verificar que la categoría existe
      const categoriaExiste = await cliente.query(
        'SELECT 1 FROM categoria WHERE id_categoria = $1',
        [idCategoria]
      );
      
      if (categoriaExiste.rows.length === 0) {
        throw crearError('Categoría no encontrada', 404);
      }
      
      // Verificar que no tenga productos asociados
      const productosAsociados = await cliente.query(
        'SELECT COUNT(*) as total FROM producto WHERE id_categoria = $1',
        [idCategoria]
      );
      
      if (parseInt(productosAsociados.rows[0].total) > 0) {
        throw crearError('No se puede eliminar la categoría porque tiene productos asociados', 400);
      }
      
      const resultado = await cliente.query(
        'UPDATE categoria SET activo = false, updated_at = NOW() WHERE id_categoria = $1 RETURNING id_categoria',
        [idCategoria]
      );
      
      return { mensaje: 'Categoría eliminada correctamente' };
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas de categorías
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT 
          COUNT(*) as total_categorias,
          COUNT(CASE WHEN activo = true THEN 1 END) as categorias_activas,
          COUNT(CASE WHEN activo = false THEN 1 END) as categorias_inactivas,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as nuevas_ultimo_mes
        FROM categoria
      `);
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Verificar si una categoría existe
  static async existe(idCategoria) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT 1 FROM categoria WHERE id_categoria = $1',
        [idCategoria]
      );
      
      return resultado.rows.length > 0;
    } finally {
      cliente.release();
    }
  }
}

module.exports = CategoriaModel;
