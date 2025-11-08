const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class PresentacionModel {
  // Crear nueva presentación
  static async crear(datosPresentacion) {
    const cliente = await pool.connect();
    try {
      // Verificar que el nombre no exista
      const nombreExiste = await cliente.query(
        'SELECT 1 FROM presentacion WHERE LOWER(nombre) = LOWER($1)',
        [datosPresentacion.nombre]
      );
      
      if (nombreExiste.rows.length > 0) {
        throw crearError('El nombre de presentación ya está registrado', 400);
      }
      
      const resultado = await cliente.query(
        `INSERT INTO presentacion (nombre, descripcion, activo)
         VALUES ($1, $2, $3)
         RETURNING id_presentacion, nombre, descripcion, activo, created_at, updated_at`,
        [
          datosPresentacion.nombre,
          datosPresentacion.descripcion || null,
          datosPresentacion.activo !== undefined ? datosPresentacion.activo : true
        ]
      );
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener presentación por ID
  static async obtenerPorId(idPresentacion) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT * FROM presentacion WHERE id_presentacion = $1',
        [idPresentacion]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Presentación no encontrada', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener todas las presentaciones con paginación y filtros
  static async obtenerTodas(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = 'SELECT * FROM presentacion WHERE 1=1';
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
      
      // Contar total
      const consultaCount = consulta.replace(/SELECT \*/, 'SELECT COUNT(*) as total');
      const resultadoCount = await cliente.query(consultaCount, parametros);
      const total = parseInt(resultadoCount.rows[0]?.total || 0);
      
      // Aplicar ordenamiento
      consulta += ' ORDER BY nombre ASC';
      
      // Aplicar paginación
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
        presentaciones: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Obtener presentaciones activas (para dropdowns)
  static async obtenerActivas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT id_presentacion, nombre FROM presentacion WHERE activo = true ORDER BY nombre'
      );
      
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Actualizar presentación
  static async actualizar(idPresentacion, datosActualizacion) {
    const cliente = await pool.connect();
    try {
      // Verificar que la presentación existe
      const presentacionExiste = await cliente.query(
        'SELECT 1 FROM presentacion WHERE id_presentacion = $1',
        [idPresentacion]
      );
      
      if (presentacionExiste.rows.length === 0) {
        throw crearError('Presentación no encontrada', 404);
      }
      
      // Verificar que el nombre no esté en uso por otra presentación
      if (datosActualizacion.nombre) {
        const nombreExiste = await cliente.query(
          'SELECT 1 FROM presentacion WHERE LOWER(nombre) = LOWER($1) AND id_presentacion != $2',
          [datosActualizacion.nombre, idPresentacion]
        );
        
        if (nombreExiste.rows.length > 0) {
          throw crearError('El nombre de presentación ya está en uso', 400);
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
      
      valores.push(idPresentacion);
      
      const consulta = `
        UPDATE presentacion 
        SET ${camposParaActualizar.join(', ')}, updated_at = NOW()
        WHERE id_presentacion = $${contadorParametros}
        RETURNING id_presentacion, nombre, descripcion, activo, created_at, updated_at
      `;
      
      const resultado = await cliente.query(consulta, valores);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Eliminar presentación (soft delete)
  static async eliminar(idPresentacion) {
    const cliente = await pool.connect();
    try {
      // Verificar que no esté en uso por productos
      const enUso = await cliente.query(
        'SELECT COUNT(*) as total FROM producto WHERE tipo_presentacion = (SELECT nombre FROM presentacion WHERE id_presentacion = $1) AND activo = true',
        [idPresentacion]
      );
      
      if (parseInt(enUso.rows[0].total) > 0) {
        throw crearError('No se puede eliminar la presentación porque está en uso por productos activos', 400);
      }
      
      const resultado = await cliente.query(
        'UPDATE presentacion SET activo = false, updated_at = NOW() WHERE id_presentacion = $1 RETURNING id_presentacion',
        [idPresentacion]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Presentación no encontrada', 404);
      }
      
      return { mensaje: 'Presentación eliminada correctamente' };
    } finally {
      cliente.release();
    }
  }
}

module.exports = PresentacionModel;

