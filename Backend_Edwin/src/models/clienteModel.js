const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class ClienteModel {
  // Crear nuevo cliente
  static async crear(datosCliente) {
    const cliente = await pool.connect();
    try {
      // Verificar que el NIT no exista (si se proporciona)
      if (datosCliente.nit) {
        const nitExiste = await cliente.query(
          'SELECT 1 FROM cliente WHERE nit = $1',
          [datosCliente.nit]
        );
        
        if (nitExiste.rows.length > 0) {
          throw crearError('El NIT ya está registrado', 400);
        }
      }
      
      // Verificar que el email no exista (si se proporciona)
      if (datosCliente.email) {
        const emailExiste = await cliente.query(
          'SELECT 1 FROM cliente WHERE email = $1',
          [datosCliente.email]
        );
        
        if (emailExiste.rows.length > 0) {
          throw crearError('El email ya está registrado', 400);
        }
      }
      
      const resultado = await cliente.query(
        `INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id_cliente, nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at`,
        [
          datosCliente.nombres,
          datosCliente.apellidos || null,
          datosCliente.nit || null,
          datosCliente.email || null,
          datosCliente.telefono || null,
          datosCliente.direccion || null,
          datosCliente.observaciones || null,
          datosCliente.activo !== undefined ? datosCliente.activo : true
        ]
      );
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener cliente por ID
  static async obtenerPorId(idCliente) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT id_cliente, nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at
         FROM cliente
         WHERE id_cliente = $1`,
        [idCliente]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Cliente no encontrado', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener clientes con paginación y filtros
  static async obtenerTodos(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT id_cliente, nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at
        FROM cliente
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
          LOWER(nombres) LIKE $${contadorParametros} OR 
          LOWER(apellidos) LIKE $${contadorParametros} OR 
          LOWER(nit) LIKE $${contadorParametros} OR 
          LOWER(email) LIKE $${contadorParametros} OR
          LOWER(telefono) LIKE $${contadorParametros}
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
        clientes: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Actualizar cliente
  static async actualizar(idCliente, datosActualizacion) {
    const cliente = await pool.connect();
    try {
      // Verificar que el cliente existe
      const clienteExiste = await cliente.query(
        'SELECT 1 FROM cliente WHERE id_cliente = $1',
        [idCliente]
      );
      
      if (clienteExiste.rows.length === 0) {
        throw crearError('Cliente no encontrado', 404);
      }
      
      // Verificar que el NIT no esté en uso por otro cliente
      if (datosActualizacion.nit) {
        const nitExiste = await cliente.query(
          'SELECT 1 FROM cliente WHERE nit = $1 AND id_cliente != $2',
          [datosActualizacion.nit, idCliente]
        );
        
        if (nitExiste.rows.length > 0) {
          throw crearError('El NIT ya está en uso por otro cliente', 400);
        }
      }
      
      // Verificar que el email no esté en uso por otro cliente
      if (datosActualizacion.email) {
        const emailExiste = await cliente.query(
          'SELECT 1 FROM cliente WHERE email = $1 AND id_cliente != $2',
          [datosActualizacion.email, idCliente]
        );
        
        if (emailExiste.rows.length > 0) {
          throw crearError('El email ya está en uso por otro cliente', 400);
        }
      }
      
      // Construir consulta de actualización
      const camposActualizables = ['nombres', 'apellidos', 'nit', 'email', 'telefono', 'direccion', 'observaciones', 'activo'];
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
      
      valores.push(idCliente);
      
      const consulta = `
        UPDATE cliente 
        SET ${camposParaActualizar.join(', ')}, updated_at = NOW()
        WHERE id_cliente = $${contadorParametros}
        RETURNING id_cliente, nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at
      `;
      
      const resultado = await cliente.query(consulta, valores);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Eliminar cliente (soft delete)
  static async eliminar(idCliente) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'UPDATE cliente SET activo = false, updated_at = NOW() WHERE id_cliente = $1 RETURNING id_cliente',
        [idCliente]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Cliente no encontrado', 404);
      }
      
      return { mensaje: 'Cliente eliminado correctamente' };
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas de clientes
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT 
          COUNT(*) as total_clientes,
          COUNT(CASE WHEN activo = true THEN 1 END) as clientes_activos,
          COUNT(CASE WHEN activo = false THEN 1 END) as clientes_inactivos,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as nuevos_ultimo_mes,
          COUNT(CASE WHEN nit IS NOT NULL THEN 1 END) as clientes_con_nit,
          COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as clientes_con_email
        FROM cliente
      `);
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener clientes por rango de fechas
  static async obtenerPorRangoFechas(desde, hasta) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT id_cliente, nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at
         FROM cliente
         WHERE created_at >= $1 AND created_at <= $2
         ORDER BY created_at DESC`,
        [desde, hasta]
      );
      
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Verificar si un cliente existe
  static async existe(idCliente) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT 1 FROM cliente WHERE id_cliente = $1',
        [idCliente]
      );
      
      return resultado.rows.length > 0;
    } finally {
      cliente.release();
    }
  }
}

module.exports = ClienteModel;
