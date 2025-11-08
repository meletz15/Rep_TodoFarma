const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class UnidadMedidaModel {
  // Crear nueva unidad de medida
  static async crear(datosUnidadMedida) {
    const cliente = await pool.connect();
    try {
      // Verificar que el nombre no exista
      const nombreExiste = await cliente.query(
        'SELECT 1 FROM unidad_medida WHERE LOWER(nombre) = LOWER($1)',
        [datosUnidadMedida.nombre]
      );
      
      if (nombreExiste.rows.length > 0) {
        throw crearError('El nombre de unidad de medida ya está registrado', 400);
      }
      
      // Verificar que el símbolo no exista
      const simboloExiste = await cliente.query(
        'SELECT 1 FROM unidad_medida WHERE LOWER(simbolo) = LOWER($1)',
        [datosUnidadMedida.simbolo]
      );
      
      if (simboloExiste.rows.length > 0) {
        throw crearError('El símbolo de unidad de medida ya está registrado', 400);
      }
      
      const resultado = await cliente.query(
        `INSERT INTO unidad_medida (nombre, simbolo, descripcion, activo)
         VALUES ($1, $2, $3, $4)
         RETURNING id_unidad_medida, nombre, simbolo, descripcion, activo, created_at, updated_at`,
        [
          datosUnidadMedida.nombre,
          datosUnidadMedida.simbolo,
          datosUnidadMedida.descripcion || null,
          datosUnidadMedida.activo !== undefined ? datosUnidadMedida.activo : true
        ]
      );
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener unidad de medida por ID
  static async obtenerPorId(idUnidadMedida) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT * FROM unidad_medida WHERE id_unidad_medida = $1',
        [idUnidadMedida]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Unidad de medida no encontrada', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener todas las unidades de medida con paginación y filtros
  static async obtenerTodas(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = 'SELECT * FROM unidad_medida WHERE 1=1';
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
          LOWER(simbolo) LIKE $${contadorParametros} OR
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
        unidadesMedida: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Obtener unidades de medida activas (para dropdowns)
  static async obtenerActivas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT id_unidad_medida, nombre, simbolo FROM unidad_medida WHERE activo = true ORDER BY nombre'
      );
      
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Actualizar unidad de medida
  static async actualizar(idUnidadMedida, datosActualizacion) {
    const cliente = await pool.connect();
    try {
      // Verificar que la unidad de medida existe
      const unidadExiste = await cliente.query(
        'SELECT 1 FROM unidad_medida WHERE id_unidad_medida = $1',
        [idUnidadMedida]
      );
      
      if (unidadExiste.rows.length === 0) {
        throw crearError('Unidad de medida no encontrada', 404);
      }
      
      // Verificar que el nombre no esté en uso por otra unidad
      if (datosActualizacion.nombre) {
        const nombreExiste = await cliente.query(
          'SELECT 1 FROM unidad_medida WHERE LOWER(nombre) = LOWER($1) AND id_unidad_medida != $2',
          [datosActualizacion.nombre, idUnidadMedida]
        );
        
        if (nombreExiste.rows.length > 0) {
          throw crearError('El nombre de unidad de medida ya está en uso', 400);
        }
      }
      
      // Verificar que el símbolo no esté en uso por otra unidad
      if (datosActualizacion.simbolo) {
        const simboloExiste = await cliente.query(
          'SELECT 1 FROM unidad_medida WHERE LOWER(simbolo) = LOWER($1) AND id_unidad_medida != $2',
          [datosActualizacion.simbolo, idUnidadMedida]
        );
        
        if (simboloExiste.rows.length > 0) {
          throw crearError('El símbolo de unidad de medida ya está en uso', 400);
        }
      }
      
      // Construir consulta de actualización
      const camposActualizables = ['nombre', 'simbolo', 'descripcion', 'activo'];
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
      
      valores.push(idUnidadMedida);
      
      const consulta = `
        UPDATE unidad_medida 
        SET ${camposParaActualizar.join(', ')}, updated_at = NOW()
        WHERE id_unidad_medida = $${contadorParametros}
        RETURNING id_unidad_medida, nombre, simbolo, descripcion, activo, created_at, updated_at
      `;
      
      const resultado = await cliente.query(consulta, valores);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Eliminar unidad de medida (soft delete)
  static async eliminar(idUnidadMedida) {
    const cliente = await pool.connect();
    try {
      // Verificar que no esté en uso por productos
      const enUso = await cliente.query(
        'SELECT COUNT(*) as total FROM producto WHERE unidad_medida = (SELECT simbolo FROM unidad_medida WHERE id_unidad_medida = $1) AND activo = true',
        [idUnidadMedida]
      );
      
      if (parseInt(enUso.rows[0].total) > 0) {
        throw crearError('No se puede eliminar la unidad de medida porque está en uso por productos activos', 400);
      }
      
      const resultado = await cliente.query(
        'UPDATE unidad_medida SET activo = false, updated_at = NOW() WHERE id_unidad_medida = $1 RETURNING id_unidad_medida',
        [idUnidadMedida]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Unidad de medida no encontrada', 404);
      }
      
      return { mensaje: 'Unidad de medida eliminada correctamente' };
    } finally {
      cliente.release();
    }
  }
}

module.exports = UnidadMedidaModel;

