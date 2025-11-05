const Joi = require('joi');
const ConfiguracionModel = require('../models/configuracionModel');
const { crearError } = require('../utils/errorHandler');

// Esquemas de validación
const esquemaFormatoSistema = Joi.object({
  formatoFecha: Joi.string().valid('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD').messages({
    'any.only': 'El formato de fecha debe ser DD/MM/YYYY, MM/DD/YYYY o YYYY-MM-DD'
  }),
  formatoHora: Joi.string().valid('24h', '12h').messages({
    'any.only': 'El formato de hora debe ser 24h o 12h'
  }),
  formatoMoneda: Joi.string().max(10).messages({
    'string.max': 'El formato de moneda no puede exceder 10 caracteres'
  }),
  separadorDecimal: Joi.string().max(5).messages({
    'string.max': 'El separador decimal no puede exceder 5 caracteres'
  }),
  separadorMiles: Joi.string().max(5).messages({
    'string.max': 'El separador de miles no puede exceder 5 caracteres'
  }),
  idioma: Joi.string().valid('es', 'en').messages({
    'any.only': 'El idioma debe ser es o en'
  }),
  zonaHoraria: Joi.string().max(50).messages({
    'string.max': 'La zona horaria no puede exceder 50 caracteres'
  })
});

const esquemaDatosFacturacion = Joi.object({
  nit: Joi.string().max(20).allow('', null).messages({
    'string.max': 'El NIT no puede exceder 20 caracteres'
  }),
  nombreEmpresa: Joi.string().max(200).messages({
    'string.max': 'El nombre de la empresa no puede exceder 200 caracteres'
  }),
  mensajeFactura: Joi.string().max(500).allow('', null).messages({
    'string.max': 'El mensaje de factura no puede exceder 500 caracteres'
  }),
  mensajePie: Joi.string().max(500).allow('', null).messages({
    'string.max': 'El mensaje de pie no puede exceder 500 caracteres'
  })
});

const esquemaDireccionEmpresa = Joi.object({
  direccion: Joi.string().max(500).allow('', null).messages({
    'string.max': 'La dirección no puede exceder 500 caracteres'
  }),
  ciudad: Joi.string().max(100).allow('', null).messages({
    'string.max': 'La ciudad no puede exceder 100 caracteres'
  }),
  departamento: Joi.string().max(100).allow('', null).messages({
    'string.max': 'El departamento no puede exceder 100 caracteres'
  }),
  codigoPostal: Joi.string().max(20).allow('', null).messages({
    'string.max': 'El código postal no puede exceder 20 caracteres'
  }),
  pais: Joi.string().max(100).allow('', null).messages({
    'string.max': 'El país no puede exceder 100 caracteres'
  })
});

const esquemaTelefonosEmpresa = Joi.object({
  telefonoPrincipal: Joi.string().max(25).allow('', null).messages({
    'string.max': 'El teléfono principal no puede exceder 25 caracteres'
  }),
  telefonoSecundario: Joi.string().max(25).allow('', null).messages({
    'string.max': 'El teléfono secundario no puede exceder 25 caracteres'
  }),
  fax: Joi.string().max(25).allow('', null).messages({
    'string.max': 'El fax no puede exceder 25 caracteres'
  }),
  whatsapp: Joi.string().max(25).allow('', null).messages({
    'string.max': 'El WhatsApp no puede exceder 25 caracteres'
  }),
  email: Joi.string().email().max(255).allow('', null).messages({
    'string.email': 'El email debe tener un formato válido',
    'string.max': 'El email no puede exceder 255 caracteres'
  }),
  sitioWeb: Joi.string().max(255).allow('', null).messages({
    'string.max': 'El sitio web no puede exceder 255 caracteres'
  })
});

class ConfiguracionController {
  // Obtener configuración del sistema
  static async obtener(req, res, next) {
    try {
      const configuracion = await ConfiguracionModel.obtener();
      
      // Transformar nombres de campos de snake_case a camelCase
      const configuracionFormateada = {
        idConfiguracion: configuracion.id_configuracion,
        formatoSistema: {
          formatoFecha: configuracion.formato_fecha,
          formatoHora: configuracion.formato_hora,
          formatoMoneda: configuracion.formato_moneda,
          separadorDecimal: configuracion.separador_decimal,
          separadorMiles: configuracion.separador_miles,
          idioma: configuracion.idioma,
          zonaHoraria: configuracion.zona_horaria
        },
        datosFacturacion: {
          nit: configuracion.nit,
          nombreEmpresa: configuracion.nombre_empresa,
          mensajeFactura: configuracion.mensaje_factura,
          mensajePie: configuracion.mensaje_pie
        },
        direccionEmpresa: {
          direccion: configuracion.direccion,
          ciudad: configuracion.ciudad,
          departamento: configuracion.departamento,
          codigoPostal: configuracion.codigo_postal,
          pais: configuracion.pais
        },
        telefonosEmpresa: {
          telefonoPrincipal: configuracion.telefono_principal,
          telefonoSecundario: configuracion.telefono_secundario,
          fax: configuracion.fax,
          whatsapp: configuracion.whatsapp,
          email: configuracion.email,
          sitioWeb: configuracion.sitio_web
        },
        fechaCreacion: configuracion.fecha_creacion,
        fechaActualizacion: configuracion.fecha_actualizacion
      };

      res.json({
        ok: true,
        mensaje: 'Configuración obtenida exitosamente',
        datos: configuracionFormateada
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar formato del sistema
  static async actualizarFormato(req, res, next) {
    try {
      const { error, value } = esquemaFormatoSistema.validate(req.body);
      
      if (error) {
        throw crearError(error.details[0].message, 400);
      }

      const configuracion = await ConfiguracionModel.actualizarFormato(value);

      res.json({
        ok: true,
        mensaje: 'Formato del sistema actualizado exitosamente',
        datos: configuracion
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar datos de facturación
  static async actualizarFacturacion(req, res, next) {
    try {
      const { error, value } = esquemaDatosFacturacion.validate(req.body);
      
      if (error) {
        throw crearError(error.details[0].message, 400);
      }

      const configuracion = await ConfiguracionModel.actualizarFacturacion(value);

      res.json({
        ok: true,
        mensaje: 'Datos de facturación actualizados exitosamente',
        datos: configuracion
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar dirección de la empresa
  static async actualizarDireccion(req, res, next) {
    try {
      const { error, value } = esquemaDireccionEmpresa.validate(req.body);
      
      if (error) {
        throw crearError(error.details[0].message, 400);
      }

      const configuracion = await ConfiguracionModel.actualizarDireccion(value);

      res.json({
        ok: true,
        mensaje: 'Dirección de empresa actualizada exitosamente',
        datos: configuracion
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar teléfonos de la empresa
  static async actualizarTelefonos(req, res, next) {
    try {
      const { error, value } = esquemaTelefonosEmpresa.validate(req.body);
      
      if (error) {
        throw crearError(error.details[0].message, 400);
      }

      const configuracion = await ConfiguracionModel.actualizarTelefonos(value);

      res.json({
        ok: true,
        mensaje: 'Teléfonos de empresa actualizados exitosamente',
        datos: configuracion
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ConfiguracionController;
