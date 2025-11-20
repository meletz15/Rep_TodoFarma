const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class PedidoModel {
  // Crear nuevo pedido
  static async crear(datosPedido) {
    console.log('=== INICIANDO CREACIÓN DE PEDIDO ===');
    console.log('Datos recibidos:', JSON.stringify(datosPedido, null, 2));
    
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      console.log('✅ Transacción iniciada');

      // Verificar que el proveedor existe
      console.log('🔍 Verificando proveedor ID:', datosPedido.proveedor_id);
      const proveedorExiste = await cliente.query(
        'SELECT 1 FROM proveedores WHERE id = $1',
        [datosPedido.proveedor_id]
      );
      
      if (proveedorExiste.rows.length === 0) {
        console.log('❌ Proveedor no encontrado');
        throw crearError('El proveedor especificado no existe', 400);
      }
      console.log('✅ Proveedor verificado');

      // Verificar que el usuario existe
      console.log('🔍 Verificando usuario ID:', datosPedido.usuario_id);
      const usuarioExiste = await cliente.query(
        'SELECT 1 FROM usuarios WHERE id_usuario = $1',
        [datosPedido.usuario_id]
      );
      
      if (usuarioExiste.rows.length === 0) {
        console.log('❌ Usuario no encontrado');
        throw crearError('El usuario especificado no existe', 400);
      }
      console.log('✅ Usuario verificado');

      // Crear el pedido
      console.log('🔍 Creando pedido principal...');
      const resultadoPedido = await cliente.query(
        `INSERT INTO pedido (proveedor_id, usuario_id, fecha_pedido, estado, total_costo, observacion)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id_pedido, proveedor_id, usuario_id, fecha_pedido, estado, total_costo, observacion, created_at, updated_at`,
        [
          datosPedido.proveedor_id,
          datosPedido.usuario_id,
          datosPedido.fecha_pedido || new Date(),
          datosPedido.estado || 'CREADO',
          datosPedido.total_costo || 0.00,
          datosPedido.observacion || null
        ]
      );

      const pedido = resultadoPedido.rows[0];
      console.log('✅ Pedido creado con ID:', pedido.id_pedido);

      // Crear los detalles del pedido
      if (datosPedido.detalles && datosPedido.detalles.length > 0) {
        // Agrupar detalles por producto para evitar duplicados
        const detallesAgrupados = new Map();
        
        for (const detalle of datosPedido.detalles) {
          // Verificar que el producto existe
          const productoExiste = await cliente.query(
            'SELECT 1 FROM producto WHERE id_producto = $1',
            [detalle.id_producto]
          );
          
          if (productoExiste.rows.length === 0) {
            throw crearError(`El producto con ID ${detalle.id_producto} no existe`, 400);
          }

          const key = detalle.id_producto;
          if (detallesAgrupados.has(key)) {
            // Si el producto ya existe, sumar las cantidades y promediar el costo
            const existente = detallesAgrupados.get(key);
            existente.cantidad += detalle.cantidad;
            existente.costo_unitario = (existente.costo_unitario + detalle.costo_unitario) / 2;
          } else {
            detallesAgrupados.set(key, {
              id_producto: detalle.id_producto,
              cantidad: detalle.cantidad,
              costo_unitario: detalle.costo_unitario
            });
          }
        }

        // Insertar los detalles agrupados
        for (const detalle of detallesAgrupados.values()) {
          await cliente.query(
            `INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario)
             VALUES ($1, $2, $3, $4)`,
            [pedido.id_pedido, detalle.id_producto, detalle.cantidad, detalle.costo_unitario]
          );
        }

        // Recalcular el total del pedido
        const totalResultado = await cliente.query(
          'SELECT SUM(cantidad * costo_unitario) as total FROM pedido_detalle WHERE id_pedido = $1',
          [pedido.id_pedido]
        );

        const totalCalculado = totalResultado.rows[0].total || 0;

        await cliente.query(
          'UPDATE pedido SET total_costo = $1 WHERE id_pedido = $2',
          [totalCalculado, pedido.id_pedido]
        );

        pedido.total_costo = totalCalculado;
      }

      await cliente.query('COMMIT');
      return pedido;
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener pedido por ID con detalles
  static async obtenerPorId(idPedido) {
    const cliente = await pool.connect();
    try {
      // Obtener el pedido
      const resultadoPedido = await cliente.query(
        `SELECT p.id_pedido, p.proveedor_id, p.usuario_id, p.fecha_pedido, p.estado, p.total_costo, p.observacion, p.created_at, p.updated_at,
                CONCAT(pr.nombre, ' ', pr.apellido) as proveedor_nombre, 
                CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
         FROM pedido p
         JOIN proveedores pr ON p.proveedor_id = pr.id
         JOIN usuarios u ON p.usuario_id = u.id_usuario
         WHERE p.id_pedido = $1`,
        [idPedido]
      );
      
      if (resultadoPedido.rows.length === 0) {
        throw crearError('Pedido no encontrado', 404);
      }

      const pedido = resultadoPedido.rows[0];

      // Obtener los detalles del pedido
      const resultadoDetalles = await cliente.query(
        `SELECT pd.id_pedido_det, pd.id_pedido, pd.id_producto, pd.cantidad, pd.costo_unitario, pd.subtotal,
                prod.nombre as producto_nombre, prod.sku, prod.codigo_barras
         FROM pedido_detalle pd
         JOIN producto prod ON pd.id_producto = prod.id_producto
         WHERE pd.id_pedido = $1
         ORDER BY pd.id_pedido_det`,
        [idPedido]
      );

      pedido.detalles = resultadoDetalles.rows;
      return pedido;
    } finally {
      cliente.release();
    }
  }

  // Obtener pedidos con paginación y filtros
  static async obtenerTodos(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT p.id_pedido, p.proveedor_id, p.usuario_id, p.fecha_pedido, p.estado, p.total_costo, p.observacion, p.created_at, p.updated_at,
               CONCAT(pr.nombre, ' ', pr.apellido) as proveedor_nombre, 
               CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
        FROM pedido p
        JOIN proveedores pr ON p.proveedor_id = pr.id
        JOIN usuarios u ON p.usuario_id = u.id_usuario
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Aplicar filtros
      if (filtros.estado) {
        consulta += ` AND p.estado = $${contadorParametros}`;
        parametros.push(filtros.estado);
        contadorParametros++;
      }
      
      if (filtros.proveedor_id) {
        consulta += ` AND p.proveedor_id = $${contadorParametros}`;
        parametros.push(filtros.proveedor_id);
        contadorParametros++;
      }
      
      if (filtros.fecha_desde) {
        consulta += ` AND p.fecha_pedido >= $${contadorParametros}`;
        parametros.push(filtros.fecha_desde);
        contadorParametros++;
      }
      
      if (filtros.fecha_hasta) {
        consulta += ` AND p.fecha_pedido <= $${contadorParametros}`;
        parametros.push(filtros.fecha_hasta);
        contadorParametros++;
      }
      
      if (filtros.busqueda) {
        consulta += ` AND (
          LOWER(pr.nombre) LIKE $${contadorParametros} OR 
          LOWER(p.observacion) LIKE $${contadorParametros}
        )`;
        parametros.push(`%${filtros.busqueda.toLowerCase()}%`);
        contadorParametros++;
      }
      
      // Contar total de registros
      // Construir consulta de conteo correctamente (el regex debe manejar múltiples líneas)
      const consultaCount = consulta.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const resultadoCount = await cliente.query(consultaCount, parametros);
      const total = parseInt(resultadoCount.rows[0]?.total || 0);
      
      // Aplicar paginación
      consulta += ` ORDER BY p.fecha_pedido DESC`;
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
      
      // Cargar detalles para cada pedido
      const pedidosConDetalles = [];
      for (const pedido of resultado.rows) {
        const detallesResultado = await cliente.query(
          `SELECT pd.id_pedido_det, pd.id_pedido, pd.id_producto, pd.cantidad, pd.costo_unitario, pd.subtotal,
                  prod.nombre as producto_nombre, prod.sku, prod.codigo_barras
           FROM pedido_detalle pd
           JOIN producto prod ON pd.id_producto = prod.id_producto
           WHERE pd.id_pedido = $1
           ORDER BY pd.id_pedido_det`,
          [pedido.id_pedido]
        );
        
        pedido.detalles = detallesResultado.rows;
        pedidosConDetalles.push(pedido);
      }
      
      return {
        pedidos: pedidosConDetalles,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Actualizar estado del pedido
  static async actualizarEstado(idPedido, nuevoEstado, detallesConFechas = null) {
    console.log(`[PEDIDO] Actualizando estado del pedido #${idPedido} a ${nuevoEstado}`);
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      console.log(`[PEDIDO] Transacción iniciada para pedido #${idPedido}`);
      
      // Verificar que el pedido existe
      const pedidoExiste = await cliente.query(
        'SELECT estado, usuario_id FROM pedido WHERE id_pedido = $1',
        [idPedido]
      );
      
      if (pedidoExiste.rows.length === 0) {
        throw crearError('Pedido no encontrado', 404);
      }

      const estadoActual = pedidoExiste.rows[0].estado;
      const usuarioId = pedidoExiste.rows[0].usuario_id;

      // Validar transición de estado
      const transicionesValidas = {
        'CREADO': ['ENVIADO', 'RECIBIDO', 'CANCELADO'],
        'ENVIADO': ['RECIBIDO', 'CANCELADO'],
        'RECIBIDO': ['CANCELADO'],
        'CANCELADO': []
      };

      if (!transicionesValidas[estadoActual].includes(nuevoEstado)) {
        throw crearError(`No se puede cambiar el estado de ${estadoActual} a ${nuevoEstado}`, 400);
      }

      // Actualizar estado del pedido
      const resultado = await cliente.query(
        'UPDATE pedido SET estado = $1, updated_at = NOW() WHERE id_pedido = $2 RETURNING *',
        [nuevoEstado, idPedido]
      );

      // Si el nuevo estado es RECIBIDO, crear movimientos de inventario
      if (nuevoEstado === 'RECIBIDO') {
        console.log(`[PEDIDO] ========================================`);
        console.log(`[PEDIDO] INICIANDO CREACIÓN DE MOVIMIENTOS`);
        console.log(`[PEDIDO] Pedido #${idPedido}, Estado: ${nuevoEstado}`);
        console.log(`[PEDIDO] ========================================`);
        
        try {
          const CargaController = require('../controllers/cargaController');
          
          // Obtener detalles del pedido
          console.log(`[PEDIDO] Obteniendo detalles del pedido #${idPedido}...`);
          const detallesPedido = await cliente.query(
            'SELECT * FROM pedido_detalle WHERE id_pedido = $1',
            [idPedido]
          );
          
          console.log(`[PEDIDO] Pedido #${idPedido} tiene ${detallesPedido.rows.length} detalles`);
          
          // Validar que el pedido tenga detalles
          if (detallesPedido.rows.length === 0) {
            console.warn(`[PEDIDO] ⚠️ Pedido #${idPedido} no tiene detalles, no se crearán movimientos`);
            throw crearError(`El pedido #${idPedido} no tiene detalles. No se pueden crear movimientos de inventario.`, 400);
          }

          // Obtener el siguiente número de lote base para este pedido
          const hoy = new Date();
          const año = hoy.getFullYear();
          const mes = String(hoy.getMonth() + 1).padStart(2, '0');
          const dia = String(hoy.getDate()).padStart(2, '0');
          const fechaFormato = `${año}${mes}${dia}`;
          
          // Obtener el último número de lote del día para inicializar el contador
          const ultimoLote = await cliente.query(
            `SELECT numero_lote FROM inventario_movimiento 
             WHERE numero_lote IS NOT NULL AND numero_lote != ''
               AND numero_lote LIKE $1
             ORDER BY id_mov DESC LIMIT 1`,
            [`LOTE-${fechaFormato}-%`]
          );
          
          let contadorLote = 0;
          if (ultimoLote.rows.length > 0 && ultimoLote.rows[0].numero_lote) {
            const match = ultimoLote.rows[0].numero_lote.match(/LOTE-\d{8}-(\d+)$/);
            if (match) {
              contadorLote = parseInt(match[1], 10);
            }
          }

          // Crear movimientos de inventario con fechas de vencimiento y números de lote
          let movimientosCreados = 0;
          for (let i = 0; i < detallesPedido.rows.length; i++) {
            const detalle = detallesPedido.rows[i];
            contadorLote++;
            
            // Buscar fecha y lote en detallesConFechas si se proporcionaron
            let fechaVencimiento = null;
            let numeroLote = null;
            
            if (detallesConFechas && detallesConFechas.length > 0) {
              const detalleConFecha = detallesConFechas.find(
                d => d.id_producto === detalle.id_producto
              );
              
              if (detalleConFecha) {
                fechaVencimiento = detalleConFecha.fecha_vencimiento || null;
                numeroLote = detalleConFecha.numero_lote || null;
              }
            }
            
            // Si no se proporcionó fecha, generar una aleatoria
            if (!fechaVencimiento) {
              fechaVencimiento = CargaController.generarFechaVencimientoAleatoria();
            }
            
            // Si no se proporcionó lote, generar uno incremental
            if (!numeroLote) {
              numeroLote = `LOTE-${fechaFormato}-${String(contadorLote).padStart(6, '0')}`;
            }

            // Crear movimiento de entrada usando la misma conexión de la transacción
            // NOTA: El trigger tr_inv_mov__apply_stock actualiza el stock automáticamente,
            // por lo que NO debemos actualizar el stock manualmente aquí
            console.log(`[PEDIDO] Creando movimiento para producto ${detalle.id_producto}, cantidad: ${detalle.cantidad}, lote: ${numeroLote}`);
            const resultadoMovimiento = await cliente.query(
              `INSERT INTO inventario_movimiento 
               (producto_id, tipo, cantidad, signo, referencia, pedido_id, usuario_id, observacion, fecha_vencimiento, numero_lote)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
               RETURNING id_mov`,
              [
                detalle.id_producto,
                'ENTRADA_COMPRA',
                detalle.cantidad,
                1,
                `Pedido #${idPedido}`,
                idPedido,
                usuarioId,
                `Recepción de pedido #${idPedido}`,
                fechaVencimiento,
                numeroLote
              ]
            );
            movimientosCreados++;
            console.log(`[PEDIDO] ✅ Movimiento creado (ID: ${resultadoMovimiento.rows[0].id_mov}) para producto ${detalle.id_producto} (el trigger actualizará el stock automáticamente)`);
          }
          
          console.log(`[PEDIDO] ✅ ${movimientosCreados} de ${detallesPedido.rows.length} movimientos creados para pedido #${idPedido}`);
          console.log(`[PEDIDO] ========================================`);
        } catch (errorCreacion) {
          console.error(`[PEDIDO] ❌ ERROR CRÍTICO al crear movimientos para pedido #${idPedido}:`, errorCreacion.message);
          console.error(`[PEDIDO] Stack:`, errorCreacion.stack);
          throw errorCreacion; // Re-lanzar para que se haga rollback
        }
      } else {
        console.log(`[PEDIDO] Estado ${nuevoEstado} no requiere creación de movimientos`);
      }

      await cliente.query('COMMIT');
      console.log(`[PEDIDO] ✅ Transacción completada para pedido #${idPedido}`);
      return resultado.rows[0];
    } catch (error) {
      console.error(`[PEDIDO] ❌ Error en pedido #${idPedido}:`, error.message);
      console.error(`[PEDIDO] Stack:`, error.stack);
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas de pedidos
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT 
          COUNT(*) as total_pedidos,
          COUNT(CASE WHEN estado = 'CREADO' THEN 1 END) as pedidos_creados,
          COUNT(CASE WHEN estado = 'ENVIADO' THEN 1 END) as pedidos_enviados,
          COUNT(CASE WHEN estado = 'RECIBIDO' THEN 1 END) as pedidos_recibidos,
          COUNT(CASE WHEN estado = 'CANCELADO' THEN 1 END) as pedidos_cancelados,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as pedidos_ultimo_mes,
          SUM(total_costo) as valor_total_pedidos
        FROM pedido
      `);
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Verificar si un pedido existe
  static async existe(idPedido) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT 1 FROM pedido WHERE id_pedido = $1',
        [idPedido]
      );
      
      return resultado.rows.length > 0;
    } finally {
      cliente.release();
    }
  }

  // ========================================
  // MÉTODOS PARA REPORTES
  // ========================================

  // Obtener análisis de proveedores
  static async obtenerAnalisisProveedores(desde, hasta) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          p.id as proveedor_id,
          CONCAT(p.nombre, ' ', p.apellido) as proveedor_nombre,
          p.empresa,
          p.telefono,
          p.correo,
          COUNT(pe.id_pedido) as total_pedidos,
          COALESCE(SUM(pe.total_costo), 0) as total_compras,
          COALESCE(AVG(pe.total_costo), 0) as pedido_promedio,
          COUNT(CASE WHEN pe.estado = 'RECIBIDO' THEN 1 END) as pedidos_recibidos,
          COUNT(CASE WHEN pe.estado = 'CANCELADO' THEN 1 END) as pedidos_cancelados,
          COUNT(CASE WHEN pe.estado = 'ENVIADO' THEN 1 END) as pedidos_enviados,
          COUNT(CASE WHEN pe.estado = 'CREADO' THEN 1 END) as pedidos_creados,
          MAX(pe.fecha_pedido) as ultimo_pedido
        FROM proveedores p
        LEFT JOIN pedido pe ON p.id = pe.proveedor_id 
          AND pe.fecha_pedido >= $1 
          AND pe.fecha_pedido <= $2
        WHERE p.estado = 'ACTIVO'
        GROUP BY p.id, p.nombre, p.apellido, p.empresa, p.telefono, p.correo
        ORDER BY total_compras DESC
      `;
      
      const resultado = await cliente.query(consulta, [desde, hasta]);
      return resultado.rows;
      
    } finally {
      cliente.release();
    }
  }

  // Obtener gastos por compras
  static async obtenerGastosPorCompras(desde, hasta) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          DATE(pe.fecha_pedido) as fecha,
          COUNT(pe.id_pedido) as total_pedidos,
          COALESCE(SUM(pe.total_costo), 0) as total_gastos,
          COALESCE(AVG(pe.total_costo), 0) as pedido_promedio
        FROM pedido pe
        WHERE pe.fecha_pedido >= $1 
          AND pe.fecha_pedido <= $2 
          AND pe.estado = 'RECIBIDO'
        GROUP BY DATE(pe.fecha_pedido)
        ORDER BY fecha ASC
      `;
      
      const resultado = await cliente.query(consulta, [desde, hasta]);
      return resultado.rows;
      
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas para dashboard
  static async obtenerEstadisticasDashboard(desde, hasta) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          COUNT(pe.id_pedido) as total_pedidos,
          COALESCE(SUM(pe.total_costo), 0) as total_compras,
          COALESCE(AVG(pe.total_costo), 0) as pedido_promedio,
          COUNT(CASE WHEN pe.estado = 'RECIBIDO' THEN 1 END) as pedidos_recibidos,
          COUNT(CASE WHEN pe.estado = 'CANCELADO' THEN 1 END) as pedidos_cancelados,
          COUNT(CASE WHEN pe.estado = 'ENVIADO' THEN 1 END) as pedidos_enviados,
          COUNT(CASE WHEN pe.estado = 'CREADO' THEN 1 END) as pedidos_creados,
          COUNT(DISTINCT pe.proveedor_id) as proveedores_activos
        FROM pedido pe
        WHERE pe.fecha_pedido >= $1 
          AND pe.fecha_pedido <= $2
      `;
      
      const resultado = await cliente.query(consulta, [desde, hasta]);
      return resultado.rows[0] || {
        total_pedidos: 0,
        total_compras: 0,
        pedido_promedio: 0,
        pedidos_recibidos: 0,
        pedidos_cancelados: 0,
        pedidos_enviados: 0,
        pedidos_creados: 0,
        proveedores_activos: 0
      };
      
    } finally {
      cliente.release();
    }
  }
}

module.exports = PedidoModel;
