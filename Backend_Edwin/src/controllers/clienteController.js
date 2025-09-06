const Joi = require('joi');
const ClienteModel = require('../models/clienteModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaCrearCliente = Joi.object({
  nombres: Joi.string().min(2).max(120).required().messages({
    'string.min': 'Los nombres deben tener al menos 2 caracteres',
    'string.max': 'Los nombres no pueden exceder 120 caracteres',
    'any.required': 'Los nombres son requeridos'
  }),
  apellidos: Joi.string().min(2).max(120).allow('', null).messages({
    'string.min': 'Los apellidos deben tener al menos 2 caracteres',
    'string.max': 'Los apellidos no pueden exceder 120 caracteres'
  }),
  nit: Joi.string().max(20).allow('', null).messages({
    'string.max': 'El NIT no puede exceder 20 caracteres'
  }),
  email: Joi.string().email().max(160).allow('', null).messages({
    'string.email': 'El email debe tener un formato válido',
    'string.max': 'El email no puede exceder 160 caracteres'
  }),
  telefono: Joi.string().max(25).allow('', null).messages({
    'string.max': 'El teléfono no puede exceder 25 caracteres'
  }),
  direccion: Joi.string().max(200).allow('', null).messages({
    'string.max': 'La dirección no puede exceder 200 caracteres'
  }),
  observaciones: Joi.string().max(300).allow('', null).messages({
    'string.max': 'Las observaciones no pueden exceder 300 caracteres'
  }),
  activo: Joi.boolean().default(true).messages({
    'boolean.base': 'El estado activo debe ser verdadero o falso'
  })
});

const esquemaActualizarCliente = Joi.object({
  nombres: Joi.string().min(2).max(120).messages({
    'string.min': 'Los nombres deben tener al menos 2 caracteres',
    'string.max': 'Los nombres no pueden exceder 120 caracteres'
  }),
  apellidos: Joi.string().min(2).max(120).allow('', null).messages({
    'string.min': 'Los apellidos deben tener al menos 2 caracteres',
    'string.max': 'Los apellidos no pueden exceder 120 caracteres'
  }),
  nit: Joi.string().max(20).allow('', null).messages({
    'string.max': 'El NIT no puede exceder 20 caracteres'
  }),
  email: Joi.string().email().max(160).allow('', null).messages({
    'string.email': 'El email debe tener un formato válido',
    'string.max': 'El email no puede exceder 160 caracteres'
  }),
  telefono: Joi.string().max(25).allow('', null).messages({
    'string.max': 'El teléfono no puede exceder 25 caracteres'
  }),
  direccion: Joi.string().max(200).allow('', null).messages({
    'string.max': 'La dirección no puede exceder 200 caracteres'
  }),
  observaciones: Joi.string().max(300).allow('', null).messages({
    'string.max': 'Las observaciones no pueden exceder 300 caracteres'
  }),
  activo: Joi.boolean().messages({
    'boolean.base': 'El estado activo debe ser verdadero o falso'
  })
});

class ClienteController {
  // Crear nuevo cliente
  static async crear(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = esquemaCrearCliente.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Crear cliente
      const cliente = await ClienteModel.crear(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Cliente creado correctamente',
        datos: {
          id_cliente: cliente.id_cliente,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          nit: cliente.nit,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          observaciones: cliente.observaciones,
          activo: cliente.activo,
          created_at: cliente.created_at,
          updated_at: cliente.updated_at
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los clientes con paginación y filtros
  static async obtenerTodos(req, res, next) {
    try {
      const { pagina, limite, activo, busqueda } = req.query;
      
      // DEBUG: Log de parámetros recibidos
      console.log('=== DEBUG CLIENTES ===');
      console.log('Query params recibidos:', { pagina, limite, activo, busqueda });
      console.log('Tipo de activo:', typeof activo);
      console.log('Valor de activo:', activo);
      
      // Validar parámetros de paginación
      const paginacionValida = validarPaginacion(pagina, limite);
      const paginacion = construirPaginacion(paginacionValida.pagina, paginacionValida.limite);
      
      // Construir filtros
      const filtros = {};
      if (activo !== undefined && activo !== '') {
        // TEMPORAL: Forzar que activo=true muestre clientes activos
        if (activo === 'true') {
          filtros.activo = true;
        } else if (activo === 'false') {
          filtros.activo = false;
        }
        console.log('Filtro activo convertido:', filtros.activo);
      }
      if (busqueda) filtros.busqueda = busqueda;
      
      console.log('Filtros finales:', filtros);
      console.log('=====================');
      
      // Obtener clientes
      const resultado = await ClienteModel.obtenerTodos(filtros, paginacion);
      
      // Construir respuesta paginada
      const respuesta = construirRespuestaPaginada(
        resultado.clientes,
        resultado.total,
        paginacionValida.pagina,
        paginacionValida.limite
      );
      
      res.json({
        ok: true,
        mensaje: 'Clientes obtenidos correctamente',
        datos: respuesta
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener cliente por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id_cliente } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_cliente);
      if (isNaN(id)) {
        throw crearError('ID de cliente inválido', 400);
      }
      
      // Obtener cliente
      const cliente = await ClienteModel.obtenerPorId(id);
      
      res.json({
        ok: true,
        mensaje: 'Cliente obtenido correctamente',
        datos: {
          id_cliente: cliente.id_cliente,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          nit: cliente.nit,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          observaciones: cliente.observaciones,
          activo: cliente.activo,
          created_at: cliente.created_at,
          updated_at: cliente.updated_at
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Actualizar cliente
  static async actualizar(req, res, next) {
    try {
      const { id_cliente } = req.params;
      const datosActualizacion = req.body;
      
      // Validar que el ID sea un número
      const id = parseInt(id_cliente);
      if (isNaN(id)) {
        throw crearError('ID de cliente inválido', 400);
      }
      
      // Validar datos de entrada
      const { error, value } = esquemaActualizarCliente.validate(datosActualizacion);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Actualizar cliente
      const cliente = await ClienteModel.actualizar(id, value);
      
      res.json({
        ok: true,
        mensaje: 'Cliente actualizado correctamente',
        datos: {
          id_cliente: cliente.id_cliente,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          nit: cliente.nit,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          observaciones: cliente.observaciones,
          activo: cliente.activo,
          created_at: cliente.created_at,
          updated_at: cliente.updated_at
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Eliminar cliente
  static async eliminar(req, res, next) {
    try {
      const { id_cliente } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_cliente);
      if (isNaN(id)) {
        throw crearError('ID de cliente inválido', 400);
      }
      
      // Eliminar cliente
      const resultado = await ClienteModel.eliminar(id);
      
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas de clientes
  static async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await ClienteModel.obtenerEstadisticas();
      
      res.json({
        ok: true,
        mensaje: 'Estadísticas obtenidas correctamente',
        datos: estadisticas
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener clientes por rango de fechas
  static async obtenerPorRangoFechas(req, res, next) {
    try {
      const { desde, hasta } = req.query;
      
      if (!desde || !hasta) {
        throw crearError('Las fechas desde y hasta son requeridas', 400);
      }
      
      // Validar formato de fechas
      const fechaDesde = new Date(desde);
      const fechaHasta = new Date(hasta);
      
      if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
        throw crearError('Formato de fecha inválido', 400);
      }
      
      if (fechaDesde > fechaHasta) {
        throw crearError('La fecha desde no puede ser mayor a la fecha hasta', 400);
      }
      
      const clientes = await ClienteModel.obtenerPorRangoFechas(desde, hasta);
      
      res.json({
        ok: true,
        mensaje: 'Clientes obtenidos correctamente',
        datos: clientes
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ClienteController;
