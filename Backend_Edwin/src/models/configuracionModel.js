const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class ConfiguracionModel {
  // Obtener la configuración del sistema (siempre será el registro con id = 1)
  static async obtener() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT * FROM configuracion_sistema WHERE id_configuracion = 1'
      );
      
      if (resultado.rows.length === 0) {
        // Si no existe, crear el registro inicial
        return await this.crearInicial();
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Crear registro inicial si no existe
  static async crearInicial() {
    const cliente = await pool.connect();
    try {
      // Intentar insertar
      const resultado = await cliente.query(
        `INSERT INTO configuracion_sistema (id_configuracion)
         SELECT 1
         WHERE NOT EXISTS (SELECT 1 FROM configuracion_sistema WHERE id_configuracion = 1)
         RETURNING *`
      );
      
      if (resultado.rows.length === 0) {
        // Si ya existe, obtenerlo
        const existente = await cliente.query(
          'SELECT * FROM configuracion_sistema WHERE id_configuracion = 1'
        );
        return existente.rows[0];
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Actualizar configuración completa
  static async actualizar(datosConfiguracion) {
    const cliente = await pool.connect();
    try {
      // Primero verificar que existe
      const existe = await cliente.query(
        'SELECT 1 FROM configuracion_sistema WHERE id_configuracion = 1'
      );
      
      if (existe.rows.length === 0) {
        await this.crearInicial();
      }

      const camposActualizables = [
        'formato_fecha', 'formato_hora', 'formato_moneda', 'separador_decimal', 
        'separador_miles', 'idioma', 'zona_horaria',
        'nit', 'nombre_empresa', 'mensaje_factura', 'mensaje_pie',
        'direccion', 'ciudad', 'departamento', 'codigo_postal', 'pais',
        'telefono_principal', 'telefono_secundario', 'fax', 'whatsapp', 
        'email', 'sitio_web'
      ];

      const camposParaActualizar = [];
      const valores = [];
      let contadorParametros = 1;

      camposActualizables.forEach(campo => {
        if (datosConfiguracion[campo] !== undefined) {
          camposParaActualizar.push(`${campo} = $${contadorParametros}`);
          valores.push(datosConfiguracion[campo]);
          contadorParametros++;
        }
      });

      if (camposParaActualizar.length === 0) {
        throw crearError('No hay campos para actualizar', 400);
      }

      // Agregar fecha_actualizacion
      camposParaActualizar.push(`fecha_actualizacion = NOW()`);
      valores.push(1); // id_configuracion

      const consulta = `
        UPDATE configuracion_sistema 
        SET ${camposParaActualizar.join(', ')}
        WHERE id_configuracion = $${contadorParametros}
        RETURNING *
      `;

      const resultado = await cliente.query(consulta, valores);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Actualizar solo formato del sistema
  static async actualizarFormato(formatoSistema) {
    const cliente = await pool.connect();
    try {
      const campos = {
        formato_fecha: formatoSistema.formatoFecha,
        formato_hora: formatoSistema.formatoHora,
        formato_moneda: formatoSistema.formatoMoneda,
        separador_decimal: formatoSistema.separadorDecimal,
        separador_miles: formatoSistema.separadorMiles,
        idioma: formatoSistema.idioma,
        zona_horaria: formatoSistema.zonaHoraria
      };
      return await this.actualizar(campos);
    } finally {
      cliente.release();
    }
  }

  // Actualizar solo datos de facturación
  static async actualizarFacturacion(datosFacturacion) {
    const cliente = await pool.connect();
    try {
      const campos = {
        nit: datosFacturacion.nit,
        nombre_empresa: datosFacturacion.nombreEmpresa,
        mensaje_factura: datosFacturacion.mensajeFactura,
        mensaje_pie: datosFacturacion.mensajePie
      };
      return await this.actualizar(campos);
    } finally {
      cliente.release();
    }
  }

  // Actualizar solo dirección
  static async actualizarDireccion(direccionEmpresa) {
    const cliente = await pool.connect();
    try {
      const campos = {
        direccion: direccionEmpresa.direccion,
        ciudad: direccionEmpresa.ciudad,
        departamento: direccionEmpresa.departamento,
        codigo_postal: direccionEmpresa.codigoPostal,
        pais: direccionEmpresa.pais
      };
      return await this.actualizar(campos);
    } finally {
      cliente.release();
    }
  }

  // Actualizar solo teléfonos
  static async actualizarTelefonos(telefonosEmpresa) {
    const cliente = await pool.connect();
    try {
      const campos = {
        telefono_principal: telefonosEmpresa.telefonoPrincipal,
        telefono_secundario: telefonosEmpresa.telefonoSecundario,
        fax: telefonosEmpresa.fax,
        whatsapp: telefonosEmpresa.whatsapp,
        email: telefonosEmpresa.email,
        sitio_web: telefonosEmpresa.sitioWeb
      };
      return await this.actualizar(campos);
    } finally {
      cliente.release();
    }
  }
}

module.exports = ConfiguracionModel;
