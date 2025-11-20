const ExcelJS = require('exceljs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

// Configurar multer para almacenar archivos temporalmente
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
    }
  }
}).single('archivo');

class CargaController {
  // Función helper para generar fecha de vencimiento aleatoria (entre 6 meses y 3 años desde hoy)
  static generarFechaVencimientoAleatoria() {
    const hoy = new Date();
    const mesesMinimos = 6;
    const mesesMaximos = 36;
    
    // Generar un número aleatorio de meses entre el mínimo y máximo
    const mesesAleatorios = Math.floor(Math.random() * (mesesMaximos - mesesMinimos + 1)) + mesesMinimos;
    
    // Crear nueva fecha sumando los meses
    const fechaVencimiento = new Date(hoy);
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + mesesAleatorios);
    
    // Formatear como YYYY-MM-DD para PostgreSQL
    const año = fechaVencimiento.getFullYear();
    const mes = String(fechaVencimiento.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaVencimiento.getDate()).padStart(2, '0');
    
    return `${año}-${mes}-${dia}`;
  }

  // Función helper para generar el siguiente número de lote
  static async generarSiguienteNumeroLote(cliente) {
    try {
      // Obtener la fecha actual en formato YYYYMMDD
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const dia = String(hoy.getDate()).padStart(2, '0');
      const fechaFormato = `${año}${mes}${dia}`;
      
      // Buscar el último número de lote del día actual
      const resultado = await cliente.query(
        `SELECT numero_lote FROM inventario_movimiento 
         WHERE numero_lote IS NOT NULL AND numero_lote != ''
           AND numero_lote LIKE $1
         ORDER BY id_mov DESC LIMIT 1`,
        [`LOTE-${fechaFormato}-%`]
      );
      
      if (resultado.rows.length > 0 && resultado.rows[0].numero_lote) {
        const ultimoLote = resultado.rows[0].numero_lote;
        
        // Extraer el número del formato LOTE-YYYYMMDD-NNNNNN
        const match = ultimoLote.match(/LOTE-\d{8}-(\d+)$/);
        if (match) {
          const numero = parseInt(match[1], 10);
          return `LOTE-${fechaFormato}-${String(numero + 1).padStart(6, '0')}`;
        }
      }
      
      // Si no hay lote previo del día actual, empezar desde 1
      return `LOTE-${fechaFormato}-000001`;
    } catch (error) {
      console.error('Error al generar número de lote:', error.message);
      // En caso de error, generar uno basado en fecha y timestamp
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const dia = String(hoy.getDate()).padStart(2, '0');
      const timestamp = Date.now();
      return `LOTE-${año}${mes}${dia}-${String(timestamp).slice(-6)}`;
    }
  }

  // Función helper para convertir "Sí"/"No" a boolean
  static convertirActivo(valor) {
    if (!valor) return true; // Por defecto true si está vacío
    
    const valorStr = valor.toString().trim().toLowerCase();
    
    // Valores que representan activo = true
    if (['sí', 'si', 's', 'yes', 'y', '1', 'true', 'verdadero', 'activo'].includes(valorStr)) {
      return true;
    }
    
    // Valores que representan activo = false
    if (['no', 'n', 'not', '0', 'false', 'falso', 'inactivo'].includes(valorStr)) {
      return false;
    }
    
    // Por defecto true si no se reconoce
    return true;
  }

  // Middleware para subir archivo
  static subirArchivo(req, res, next) {
    upload(req, res, (err) => {
      if (err) {
        console.error('Error en multer:', err);
        return next(crearError(err.message, 400));
      }
      if (!req.file) {
        return next(crearError('No se proporcionó ningún archivo', 400));
      }
      // Verificar que el tipo esté presente
      if (!req.body.tipo) {
        // Limpiar archivo si falta el tipo
        if (req.file && fs.existsSync(req.file.path)) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            // Ignorar
          }
        }
        return next(crearError('Tipo de carga no especificado en el formulario', 400));
      }
      next();
    });
  }

  // Procesar Excel y devolver preview
  static async procesarExcel(req, res, next) {
    let cliente = null;
    try {
      // El tipo viene en req.body cuando se envía como FormData
      const tipo = req.body.tipo || req.body.tipoCarga; // proveedores, categorias, marcas, presentaciones, unidades-medida, productos
      
      if (!req.file) {
        throw crearError('No se proporcionó ningún archivo', 400);
      }
      
      if (!tipo) {
        throw crearError('Tipo de carga no especificado', 400);
      }

      const archivoPath = req.file.path;
      
      // Verificar que el archivo existe
      if (!fs.existsSync(archivoPath)) {
        throw crearError('El archivo no se pudo guardar correctamente', 500);
      }
      
      cliente = await pool.connect();

      let workbook;
      try {
        workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(archivoPath);
      } catch (error) {
        throw crearError(`Error al leer el archivo Excel: ${error.message}`, 400);
      }

      if (!workbook.worksheets || workbook.worksheets.length === 0) {
        throw crearError('El archivo Excel no contiene hojas de trabajo', 400);
      }

      const worksheet = workbook.worksheets[0];
      
      if (!worksheet || worksheet.rowCount < 1) {
        throw crearError('El archivo Excel está vacío o no tiene datos', 400);
      }
      
      const datos = [];
      const errores = [];

      // Leer encabezados
      const headers = [];
      try {
        worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
          headers[colNumber] = cell.value?.toString().trim().toLowerCase() || '';
        });
      } catch (error) {
        throw crearError(`Error al leer los encabezados del archivo: ${error.message}`, 400);
      }
      
      if (headers.length === 0) {
        throw crearError('No se encontraron encabezados en el archivo Excel', 400);
      }

      // Leer datos desde la fila 2
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const fila = {};

        // Verificar si la fila está vacía
        let filaVacia = true;
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
            filaVacia = false;
          }
        });

        if (filaVacia) continue;

        // Mapear valores según los encabezados
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber];
          if (header) {
            fila[header] = cell.value !== null && cell.value !== undefined ? cell.value.toString().trim() : '';
          }
        });

        // Validar y transformar según el tipo
        const resultado = await CargaController.validarYTransformarFila(fila, tipo, rowNumber, cliente);
        
        if (resultado.error) {
          errores.push({
            fila: rowNumber,
            datos: fila,
            error: resultado.error
          });
        } else {
          datos.push(resultado.datos);
        }
      }

      // Guardar todos los datos en req para usarlos en confirmarCarga
      req.datosProcesados = datos;
      req.erroresProcesados = errores;

      res.json({
        ok: true,
        mensaje: 'Archivo procesado correctamente',
        datos: {
          totalFilas: datos.length + errores.length,
          filasValidas: datos.length,
          filasConError: errores.length,
          preview: datos.slice(0, 10), // Primeras 10 filas como preview
          errores: errores.slice(0, 10), // Primeros 10 errores
          todosLosDatos: datos // Todos los datos válidos para confirmar
        }
      });
    } catch (error) {
      console.error('Error al procesar Excel:', error);
      console.error('Stack:', error.stack);
      
      // Limpiar archivo temporal en caso de error
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error('Error al eliminar archivo temporal:', e);
        }
      }
      
      // Si el error ya es un ErrorAplicacion, pasarlo directamente
      if (error.esErrorOperacional) {
        return next(error);
      }
      
      // Si es otro tipo de error, convertirlo
      const errorMensaje = error.message || 'Error al procesar el archivo Excel';
      next(crearError(errorMensaje, 500));
    } finally {
      if (cliente) {
        cliente.release();
      }
      // NO eliminar el archivo aquí porque se necesita para el preview
      // Se eliminará después de confirmar la carga o después de un tiempo
    }
  }

  // Validar y transformar una fila según el tipo
  static async validarYTransformarFila(fila, tipo, numeroFila, cliente) {
    try {
      switch (tipo) {
        case 'proveedores':
          return await CargaController.validarProveedor(fila, numeroFila, cliente);
        case 'categorias':
          return await CargaController.validarCategoria(fila, numeroFila, cliente);
        case 'marcas':
          return await CargaController.validarMarca(fila, numeroFila, cliente);
        case 'presentaciones':
          return await CargaController.validarPresentacion(fila, numeroFila, cliente);
        case 'unidades-medida':
          return await CargaController.validarUnidadMedida(fila, numeroFila, cliente);
        case 'productos':
          return await CargaController.validarProducto(fila, numeroFila, cliente);
        default:
          return { error: `Tipo de carga no válido: ${tipo}` };
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async validarProveedor(fila, numeroFila, cliente) {
    // Validar campos requeridos según la estructura de la BD
    const nombre = fila.nombre || fila['nombre del proveedor'] || '';
    if (!nombre || nombre.trim() === '') {
      return { error: 'El nombre es requerido' };
    }
    
    if (nombre.length > 80) {
      return { error: 'El nombre no puede exceder 80 caracteres' };
    }

    const apellido = fila.apellido || fila['apellido'] || '';
    if (!apellido || apellido.trim() === '') {
      return { error: 'El apellido es requerido' };
    }
    
    if (apellido.length > 80) {
      return { error: 'El apellido no puede exceder 80 caracteres' };
    }

    // Correo es requerido (NOT NULL en BD)
    const correo = fila.email || fila['correo'] || fila['correo electrónico'] || '';
    if (!correo || correo.trim() === '') {
      return { error: 'El correo electrónico es requerido' };
    }
    
    if (correo.length > 120) {
      return { error: 'El correo no puede exceder 120 caracteres' };
    }

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return { error: 'El formato del correo electrónico no es válido' };
    }

    // Verificar si el correo ya existe (UNIQUE constraint)
    const correoExiste = await cliente.query(
      'SELECT 1 FROM proveedores WHERE LOWER(correo) = LOWER($1)',
      [correo.trim()]
    );
    if (correoExiste.rows.length > 0) {
      // Verificar si es el mismo proveedor (mismo nombre y apellido)
      const mismoProveedor = await cliente.query(
        'SELECT 1 FROM proveedores WHERE LOWER(correo) = LOWER($1) AND LOWER(nombre) = LOWER($2) AND LOWER(apellido) = LOWER($3)',
        [correo.trim(), nombre.trim(), apellido.trim()]
      );
      if (mismoProveedor.rows.length === 0) {
        return { error: `El correo electrónico ${correo} ya está registrado para otro proveedor` };
      }
    }

    // Campos opcionales
    const telefono = fila.telefono || fila['teléfono'] || null;
    if (telefono && telefono.length > 20) {
      return { error: 'El teléfono no puede exceder 20 caracteres' };
    }

    const direccion = fila.direccion || fila['dirección'] || null;
    
    const empresa = fila.empresa || fila['empresa'] || null;
    if (empresa && empresa.length > 150) {
      return { error: 'La empresa no puede exceder 150 caracteres' };
    }

    // Convertir estado: "Sí" -> "ACTIVO", "No" -> "INACTIVO"
    const activo = CargaController.convertirActivo(fila.activo);
    const estado = activo ? 'ACTIVO' : 'INACTIVO';

    // Verificar si ya existe (por nombre y apellido para mayor precisión)
    const existe = await cliente.query(
      'SELECT 1 FROM proveedores WHERE LOWER(nombre) = LOWER($1) AND LOWER(apellido) = LOWER($2)',
      [nombre, apellido]
    );

    return {
      datos: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono ? telefono.trim() : null,
        correo: correo.trim(),
        direccion: direccion ? direccion.trim() : null,
        empresa: empresa ? empresa.trim() : null,
        estado: estado,
        yaExiste: existe.rows.length > 0
      }
    };
  }

  static async validarCategoria(fila, numeroFila, cliente) {
    const nombre = fila.nombre || fila['nombre de la categoría'] || '';
    if (!nombre || nombre.trim() === '') {
      return { error: 'El nombre es requerido' };
    }
    
    if (nombre.length > 100) {
      return { error: 'El nombre no puede exceder 100 caracteres' };
    }

    const descripcion = fila.descripcion || fila['descripción'] || null;
    if (descripcion && descripcion.length > 255) {
      return { error: 'La descripción no puede exceder 255 caracteres' };
    }

    const existe = await cliente.query(
      'SELECT 1 FROM categoria WHERE LOWER(nombre) = LOWER($1)',
      [nombre.trim()]
    );

    return {
      datos: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        activo: CargaController.convertirActivo(fila.activo),
        yaExiste: existe.rows.length > 0
      }
    };
  }

  static async validarMarca(fila, numeroFila, cliente) {
    const nombre = fila.nombre || fila['nombre de la marca'] || '';
    if (!nombre || nombre.trim() === '') {
      return { error: 'El nombre es requerido' };
    }
    
    if (nombre.length > 120) {
      return { error: 'El nombre no puede exceder 120 caracteres' };
    }

    const descripcion = fila.descripcion || fila['descripción'] || null;
    if (descripcion && descripcion.length > 255) {
      return { error: 'La descripción no puede exceder 255 caracteres' };
    }

    const existe = await cliente.query(
      'SELECT 1 FROM marca WHERE LOWER(nombre) = LOWER($1)',
      [nombre.trim()]
    );

    return {
      datos: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        activo: CargaController.convertirActivo(fila.activo),
        yaExiste: existe.rows.length > 0
      }
    };
  }

  static async validarPresentacion(fila, numeroFila, cliente) {
    const nombre = fila.nombre || fila['nombre de la presentación'] || '';
    if (!nombre || nombre.trim() === '') {
      return { error: 'El nombre es requerido' };
    }
    
    if (nombre.length > 50) {
      return { error: 'El nombre no puede exceder 50 caracteres' };
    }

    const descripcion = fila.descripcion || fila['descripción'] || null;
    if (descripcion && descripcion.length > 255) {
      return { error: 'La descripción no puede exceder 255 caracteres' };
    }

    const existe = await cliente.query(
      'SELECT 1 FROM presentacion WHERE LOWER(nombre) = LOWER($1)',
      [nombre.trim()]
    );

    return {
      datos: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        activo: CargaController.convertirActivo(fila.activo),
        yaExiste: existe.rows.length > 0
      }
    };
  }

  static async validarUnidadMedida(fila, numeroFila, cliente) {
    const nombre = fila.nombre || fila['nombre de la unidad'] || '';
    const simbolo = fila.simbolo || fila.símbolo || fila['símbolo de la unidad'] || '';
    
    if (!nombre || nombre.trim() === '') {
      return { error: 'El nombre es requerido' };
    }
    
    if (nombre.length > 20) {
      return { error: 'El nombre no puede exceder 20 caracteres' };
    }
    
    if (!simbolo || simbolo.trim() === '') {
      return { error: 'El símbolo es requerido' };
    }
    
    if (simbolo.length > 10) {
      return { error: 'El símbolo no puede exceder 10 caracteres' };
    }

    const descripcion = fila.descripcion || fila['descripción'] || null;
    if (descripcion && descripcion.length > 255) {
      return { error: 'La descripción no puede exceder 255 caracteres' };
    }

    const existe = await cliente.query(
      'SELECT 1 FROM unidad_medida WHERE LOWER(nombre) = LOWER($1) OR LOWER(simbolo) = LOWER($2)',
      [nombre.trim(), simbolo.trim()]
    );

    return {
      datos: {
        nombre: nombre.trim(),
        simbolo: simbolo.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        activo: CargaController.convertirActivo(fila.activo),
        yaExiste: existe.rows.length > 0
      }
    };
  }

  static async validarProducto(fila, numeroFila, cliente) {
    const nombre = fila.nombre || fila['nombre del producto'] || '';
    if (!nombre || nombre.trim() === '') {
      return { error: 'El nombre es requerido' };
    }
    
    if (nombre.length > 140) {
      return { error: 'El nombre no puede exceder 140 caracteres' };
    }

    // Validar categoría (requerida) - crear automáticamente si no existe
    let idCategoria = null;
    const categoriaNombre = fila.categoria || fila['categoría'] || fila['nombre de categoría'] || fila['categoria_nombre'] || '';
    if (!categoriaNombre || categoriaNombre.trim() === '') {
      return { error: 'La categoría es requerida' };
    }
    let categoriaRes = await cliente.query(
      'SELECT id_categoria FROM categoria WHERE LOWER(nombre) = LOWER($1) AND activo = true',
      [categoriaNombre.trim()]
    );
    
    if (categoriaRes.rows.length === 0) {
      // Verificar si existe pero está inactiva
      const categoriaInactiva = await cliente.query(
        'SELECT id_categoria FROM categoria WHERE LOWER(nombre) = LOWER($1)',
        [categoriaNombre.trim()]
      );
      
      if (categoriaInactiva.rows.length > 0) {
        // Reactivar la categoría
        await cliente.query(
          'UPDATE categoria SET activo = true, updated_at = NOW() WHERE id_categoria = $1',
          [categoriaInactiva.rows[0].id_categoria]
        );
        idCategoria = categoriaInactiva.rows[0].id_categoria;
      } else {
        // Crear nueva categoría automáticamente
        const nuevaCategoria = await cliente.query(
          'INSERT INTO categoria (nombre, descripcion, activo) VALUES ($1, $2, $3) RETURNING id_categoria',
          [categoriaNombre.trim(), `Categoría: ${categoriaNombre.trim()}`, true]
        );
        idCategoria = nuevaCategoria.rows[0].id_categoria;
      }
    } else {
      idCategoria = categoriaRes.rows[0].id_categoria;
    }

    // Validar marca (opcional según BD) - crear automáticamente si no existe
    let idMarca = null;
    const marcaNombre = fila.marca || fila['nombre de marca'] || fila['marca_nombre'] || '';
    if (marcaNombre && marcaNombre.trim() !== '') {
      let marcaRes = await cliente.query(
        'SELECT id_marca FROM marca WHERE LOWER(nombre) = LOWER($1) AND activo = true',
        [marcaNombre.trim()]
      );
      
      if (marcaRes.rows.length === 0) {
        // Verificar si existe pero está inactiva
        const marcaInactiva = await cliente.query(
          'SELECT id_marca FROM marca WHERE LOWER(nombre) = LOWER($1)',
          [marcaNombre.trim()]
        );
        
        if (marcaInactiva.rows.length > 0) {
          // Reactivar la marca
          await cliente.query(
            'UPDATE marca SET activo = true, updated_at = NOW() WHERE id_marca = $1',
            [marcaInactiva.rows[0].id_marca]
          );
          idMarca = marcaInactiva.rows[0].id_marca;
        } else {
          // Crear nueva marca automáticamente
          const nuevaMarca = await cliente.query(
            'INSERT INTO marca (nombre, descripcion, activo) VALUES ($1, $2, $3) RETURNING id_marca',
            [marcaNombre.trim(), `Marca: ${marcaNombre.trim()}`, true]
          );
          idMarca = nuevaMarca.rows[0].id_marca;
        }
      } else {
        idMarca = marcaRes.rows[0].id_marca;
      }
    }

    // Validar campos opcionales con límites
    const sku = fila.sku || fila['código sku'] || null;
    if (sku && sku.trim() !== '') {
      if (sku.length > 40) {
        return { error: 'El SKU no puede exceder 40 caracteres' };
      }
      // Verificar si el SKU ya existe (UNIQUE constraint)
      const skuExiste = await cliente.query(
        'SELECT 1 FROM producto WHERE sku = $1',
        [sku.trim()]
      );
      if (skuExiste.rows.length > 0) {
        // Verificar si es el mismo producto (mismo nombre)
        const mismoProducto = await cliente.query(
          'SELECT 1 FROM producto WHERE sku = $1 AND LOWER(nombre) = LOWER($2)',
          [sku.trim(), nombre.trim()]
        );
        if (mismoProducto.rows.length === 0) {
          return { error: `El SKU ${sku} ya está registrado para otro producto` };
        }
      }
    }

    const codigoBarras = fila['código de barras'] || fila.codigo_barras || null;
    if (codigoBarras && codigoBarras.trim() !== '') {
      if (codigoBarras.length > 64) {
        return { error: 'El código de barras no puede exceder 64 caracteres' };
      }
      // Verificar si el código de barras ya existe (UNIQUE constraint)
      const codigoExiste = await cliente.query(
        'SELECT 1 FROM producto WHERE codigo_barras = $1',
        [codigoBarras.trim()]
      );
      if (codigoExiste.rows.length > 0) {
        // Verificar si es el mismo producto (mismo nombre)
        const mismoProducto = await cliente.query(
          'SELECT 1 FROM producto WHERE codigo_barras = $1 AND LOWER(nombre) = LOWER($2)',
          [codigoBarras.trim(), nombre.trim()]
        );
        if (mismoProducto.rows.length === 0) {
          return { error: `El código de barras ${codigoBarras} ya está registrado para otro producto` };
        }
      }
    }

    const descripcion = fila.descripcion || fila['descripción'] || null;
    if (descripcion && descripcion.length > 500) {
      return { error: 'La descripción no puede exceder 500 caracteres' };
    }

    const tipoPresentacion = fila['tipo de presentación'] || fila.tipo_presentacion || fila.presentacion || fila['tipo presentacion'] || null;
    if (tipoPresentacion && tipoPresentacion.length > 50) {
      return { error: 'El tipo de presentación no puede exceder 50 caracteres' };
    }

    const unidadMedida = fila['unidad de medida'] || fila.unidad_medida || fila.unidad || fila['unidad medida'] || null;
    if (unidadMedida && unidadMedida.length > 20) {
      return { error: 'La unidad de medida no puede exceder 20 caracteres' };
    }

    const precioUnitario = parseFloat(fila.precio || fila['precio unitario'] || fila.precio_unitario || fila['precio'] || 0) || 0;
    if (precioUnitario < 0) {
      return { error: 'El precio unitario no puede ser negativo' };
    }

    const stock = parseInt(fila.stock || 0) || 0;
    if (isNaN(stock) || stock < 0) {
      return { error: 'El stock debe ser un número entero no negativo' };
    }

    const cantidadPresentacion = fila['cantidad de presentación'] || fila.cantidad_presentacion || fila.cantidad || fila['cantidad presentacion'] || null;
    const cantidadPresentacionNum = cantidadPresentacion ? parseFloat(cantidadPresentacion) : null;

    // Validar y generar fecha de vencimiento si no existe
    let fechaVencimiento = null;
    const fechaVencimientoStr = fila['fecha de vencimiento'] || fila.fecha_vencimiento || fila['fecha vencimiento'] || null;
    
    if (fechaVencimientoStr && fechaVencimientoStr.trim() !== '') {
      // Intentar parsear la fecha
      const fechaParseada = new Date(fechaVencimientoStr);
      if (!isNaN(fechaParseada.getTime())) {
        // Validar que la fecha no sea anterior a hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaParseada >= hoy) {
          const año = fechaParseada.getFullYear();
          const mes = String(fechaParseada.getMonth() + 1).padStart(2, '0');
          const dia = String(fechaParseada.getDate()).padStart(2, '0');
          fechaVencimiento = `${año}-${mes}-${dia}`;
        }
      }
    }
    
    // Si no hay fecha de vencimiento válida, generar una aleatoria
    if (!fechaVencimiento) {
      fechaVencimiento = CargaController.generarFechaVencimientoAleatoria();
    }

    return {
      datos: {
        nombre: nombre.trim(),
        sku: sku ? sku.trim() : null,
        codigo_barras: codigoBarras ? codigoBarras.trim() : null,
        id_categoria: idCategoria,
        id_marca: idMarca,
        descripcion: descripcion ? descripcion.trim() : null,
        precio_unitario: precioUnitario,
        stock: stock,
        fecha_vencimiento: fechaVencimiento,
        tipo_presentacion: tipoPresentacion ? tipoPresentacion.trim() : null,
        cantidad_presentacion: cantidadPresentacionNum,
        unidad_medida: unidadMedida ? unidadMedida.trim() : null,
        activo: CargaController.convertirActivo(fila.activo)
      }
    };
  }

  // Confirmar carga de datos
  static async confirmarCarga(req, res, next) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      const { tipo, datos } = req.body;
      
      if (!datos || !Array.isArray(datos) || datos.length === 0) {
        throw crearError('No hay datos para cargar', 400);
      }
      
      console.log(`Confirmando carga de ${datos.length} registros de tipo: ${tipo}`);
      
      // Obtener usuario_id del request (si está autenticado)
      const usuarioId = req.usuario?.id_usuario || null;
      
      const resultados = {
        creados: 0,
        actualizados: 0,
        errores: []
      };

      // Para productos, inicializar contador de lote
      let contadorLote = null;
      if (tipo === 'productos') {
        // Obtener el último número de lote del día para inicializar el contador
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        const fechaFormato = `${año}${mes}${dia}`;
        
        const ultimoLote = await cliente.query(
          `SELECT numero_lote FROM inventario_movimiento 
           WHERE numero_lote IS NOT NULL AND numero_lote != ''
             AND numero_lote LIKE $1
           ORDER BY id_mov DESC LIMIT 1`,
          [`LOTE-${fechaFormato}-%`]
        );
        
        if (ultimoLote.rows.length > 0 && ultimoLote.rows[0].numero_lote) {
          const match = ultimoLote.rows[0].numero_lote.match(/LOTE-\d{8}-(\d+)$/);
          if (match) {
            contadorLote = parseInt(match[1], 10);
          }
        }
        
        // Inicializar contador en 0 si no hay lote previo
        if (contadorLote === null) {
          contadorLote = 0;
        }
      }

      for (let i = 0; i < datos.length; i++) {
        try {
          switch (tipo) {
            case 'proveedores':
              await CargaController.cargarProveedor(datos[i], cliente, resultados);
              break;
            case 'categorias':
              await CargaController.cargarCategoria(datos[i], cliente, resultados);
              break;
            case 'marcas':
              await CargaController.cargarMarca(datos[i], cliente, resultados);
              break;
            case 'presentaciones':
              await CargaController.cargarPresentacion(datos[i], cliente, resultados);
              break;
            case 'unidades-medida':
              await CargaController.cargarUnidadMedida(datos[i], cliente, resultados);
              break;
            case 'productos':
              contadorLote++;
              await CargaController.cargarProducto(datos[i], cliente, resultados, usuarioId, contadorLote);
              break;
            default:
              throw new Error(`Tipo de carga no válido: ${tipo}`);
          }
        } catch (error) {
          console.error(`Error al cargar registro ${i + 1}:`, error.message);
          resultados.errores.push({
            indice: i,
            datos: datos[i],
            error: error.message
          });
        }
      }
      
      console.log(`Resultados: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores.length} errores`);

      await cliente.query('COMMIT');

      res.json({
        ok: true,
        mensaje: 'Carga completada',
        datos: resultados
      });
    } catch (error) {
      await cliente.query('ROLLBACK');
      next(error);
    } finally {
      cliente.release();
    }
  }

  static async cargarProveedor(datos, cliente, resultados) {
    // Verificar si ya existe en la base de datos (por nombre y apellido)
    const existe = await cliente.query(
      'SELECT 1 FROM proveedores WHERE LOWER(nombre) = LOWER($1) AND LOWER(apellido) = LOWER($2)',
      [datos.nombre, datos.apellido]
    );
    
    const yaExiste = existe.rows.length > 0 || datos.yaExiste === true;
    
    if (yaExiste) {
      const result = await cliente.query(
        `UPDATE proveedores SET 
         telefono = $1, 
         correo = $2, 
         direccion = $3, 
         empresa = $4,
         estado = $5
         WHERE LOWER(nombre) = LOWER($6) AND LOWER(apellido) = LOWER($7)`,
        [datos.telefono, datos.correo, datos.direccion, datos.empresa, datos.estado, datos.nombre, datos.apellido]
      );
      if (result.rowCount > 0) {
        resultados.actualizados++;
      }
    } else {
      await cliente.query(
        `INSERT INTO proveedores (nombre, apellido, telefono, correo, direccion, empresa, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [datos.nombre, datos.apellido, datos.telefono, datos.correo, datos.direccion, datos.empresa, datos.estado]
      );
      resultados.creados++;
    }
  }

  static async cargarCategoria(datos, cliente, resultados) {
    // Verificar si ya existe en la base de datos
    const existe = await cliente.query(
      'SELECT 1 FROM categoria WHERE LOWER(nombre) = LOWER($1)',
      [datos.nombre]
    );
    
    const yaExiste = existe.rows.length > 0 || datos.yaExiste === true;
    
    if (yaExiste) {
      const result = await cliente.query(
        `UPDATE categoria SET descripcion = $1, activo = $2, updated_at = NOW()
         WHERE LOWER(nombre) = LOWER($3)`,
        [datos.descripcion, datos.activo, datos.nombre]
      );
      if (result.rowCount > 0) {
        resultados.actualizados++;
      }
    } else {
      await cliente.query(
        `INSERT INTO categoria (nombre, descripcion, activo)
         VALUES ($1, $2, $3)`,
        [datos.nombre, datos.descripcion, datos.activo]
      );
      resultados.creados++;
    }
  }

  static async cargarMarca(datos, cliente, resultados) {
    // Verificar si ya existe en la base de datos
    const existe = await cliente.query(
      'SELECT 1 FROM marca WHERE LOWER(nombre) = LOWER($1)',
      [datos.nombre]
    );
    
    const yaExiste = existe.rows.length > 0 || datos.yaExiste === true;
    
    if (yaExiste) {
      const result = await cliente.query(
        `UPDATE marca SET descripcion = $1, activo = $2, updated_at = NOW()
         WHERE LOWER(nombre) = LOWER($3)`,
        [datos.descripcion, datos.activo, datos.nombre]
      );
      if (result.rowCount > 0) {
        resultados.actualizados++;
      }
    } else {
      await cliente.query(
        `INSERT INTO marca (nombre, descripcion, activo)
         VALUES ($1, $2, $3)`,
        [datos.nombre, datos.descripcion, datos.activo]
      );
      resultados.creados++;
    }
  }

  static async cargarPresentacion(datos, cliente, resultados) {
    // Verificar si ya existe en la base de datos
    const existe = await cliente.query(
      'SELECT 1 FROM presentacion WHERE LOWER(nombre) = LOWER($1)',
      [datos.nombre]
    );
    
    const yaExiste = existe.rows.length > 0 || datos.yaExiste === true;
    
    if (yaExiste) {
      const result = await cliente.query(
        `UPDATE presentacion SET descripcion = $1, activo = $2, updated_at = NOW()
         WHERE LOWER(nombre) = LOWER($3)`,
        [datos.descripcion, datos.activo, datos.nombre]
      );
      if (result.rowCount > 0) {
        resultados.actualizados++;
      }
    } else {
      await cliente.query(
        `INSERT INTO presentacion (nombre, descripcion, activo)
         VALUES ($1, $2, $3)`,
        [datos.nombre, datos.descripcion, datos.activo]
      );
      resultados.creados++;
    }
  }

  static async cargarUnidadMedida(datos, cliente, resultados) {
    // Verificar si ya existe en la base de datos
    const existe = await cliente.query(
      'SELECT 1 FROM unidad_medida WHERE LOWER(nombre) = LOWER($1) OR LOWER(simbolo) = LOWER($2)',
      [datos.nombre, datos.simbolo]
    );
    
    const yaExiste = existe.rows.length > 0 || datos.yaExiste === true;
    
    if (yaExiste) {
      const result = await cliente.query(
        `UPDATE unidad_medida SET descripcion = $1, activo = $2, updated_at = NOW()
         WHERE LOWER(nombre) = LOWER($3) OR LOWER(simbolo) = LOWER($4)`,
        [datos.descripcion, datos.activo, datos.nombre, datos.simbolo]
      );
      if (result.rowCount > 0) {
        resultados.actualizados++;
      }
    } else {
      await cliente.query(
        `INSERT INTO unidad_medida (nombre, simbolo, descripcion, activo)
         VALUES ($1, $2, $3, $4)`,
        [datos.nombre, datos.simbolo, datos.descripcion, datos.activo]
      );
      resultados.creados++;
    }
  }

  static async cargarProducto(datos, cliente, resultados, usuarioId = null, contadorLote = null) {
    if (!datos.id_categoria) {
      throw new Error('La categoría es requerida');
    }

    // Buscar el símbolo de la unidad de medida si se proporciona
    let simboloUnidadMedida = datos.unidad_medida;
    if (datos.unidad_medida) {
      // Buscar por nombre primero (activa)
      let unidadRes = await cliente.query(
        'SELECT simbolo FROM unidad_medida WHERE LOWER(nombre) = LOWER($1) AND activo = true',
        [datos.unidad_medida]
      );
      
      if (unidadRes.rows.length > 0) {
        simboloUnidadMedida = unidadRes.rows[0].simbolo;
      } else {
        // Verificar si existe pero está inactiva
        const unidadInactiva = await cliente.query(
          'SELECT simbolo, id_unidad_medida FROM unidad_medida WHERE LOWER(nombre) = LOWER($1)',
          [datos.unidad_medida]
        );
        
        if (unidadInactiva.rows.length > 0) {
          // Reactivar la unidad de medida
          await cliente.query(
            'UPDATE unidad_medida SET activo = true, updated_at = NOW() WHERE id_unidad_medida = $1',
            [unidadInactiva.rows[0].id_unidad_medida]
          );
          simboloUnidadMedida = unidadInactiva.rows[0].simbolo;
        } else {
          // Si no se encuentra por nombre, buscar por símbolo
          const simboloRes = await cliente.query(
            'SELECT simbolo FROM unidad_medida WHERE LOWER(simbolo) = LOWER($1) AND activo = true',
            [datos.unidad_medida]
          );
          
          if (simboloRes.rows.length > 0) {
            simboloUnidadMedida = simboloRes.rows[0].simbolo;
          } else {
            // Si no se encuentra por símbolo, buscar por símbolo inactivo
            const simboloInactivo = await cliente.query(
              'SELECT simbolo, id_unidad_medida FROM unidad_medida WHERE LOWER(simbolo) = LOWER($1)',
              [datos.unidad_medida]
            );
            
            if (simboloInactivo.rows.length > 0) {
              // Reactivar la unidad de medida
              await cliente.query(
                'UPDATE unidad_medida SET activo = true, updated_at = NOW() WHERE id_unidad_medida = $1',
                [simboloInactivo.rows[0].id_unidad_medida]
              );
              simboloUnidadMedida = simboloInactivo.rows[0].simbolo;
            } else {
              throw new Error(`La unidad de medida "${datos.unidad_medida}" no existe o no está activa en la tabla unidad_medida`);
            }
          }
        }
      }
    }

    // Verificar si el producto ya existe (por SKU o nombre)
    let existe = null;
    if (datos.sku) {
      existe = await cliente.query(
        'SELECT 1 FROM producto WHERE sku = $1',
        [datos.sku]
      );
    }
    
    if (!existe || existe.rows.length === 0) {
      existe = await cliente.query(
        'SELECT 1 FROM producto WHERE LOWER(nombre) = LOWER($1)',
        [datos.nombre]
      );
    }

    const yaExiste = existe.rows.length > 0;

    let idProducto = null;
    let cantidadStockAgregada = 0;

    if (yaExiste && datos.sku) {
      // Obtener el id_producto antes de actualizar
      const productoExistente = await cliente.query(
        'SELECT id_producto, stock FROM producto WHERE sku = $1',
        [datos.sku]
      );
      
      if (productoExistente.rows.length > 0) {
        idProducto = productoExistente.rows[0].id_producto;
        const stockAnterior = productoExistente.rows[0].stock;
        
        // Actualizar por SKU - SUMAR stock al existente (no reemplazarlo)
        // Si el producto no tiene fecha_vencimiento, asignar la del Excel
        const result = await cliente.query(
          `UPDATE producto SET 
           nombre = $1,
           codigo_barras = $2,
           id_categoria = $3,
           id_marca = $4,
           descripcion = $5,
           precio_unitario = $6,
           stock = stock + $7,
           fecha_vencimiento = COALESCE(fecha_vencimiento, $8),
           tipo_presentacion = $9,
           cantidad_presentacion = $10,
           unidad_medida = $11,
           activo = $12,
           updated_at = NOW()
           WHERE sku = $13`,
          [datos.nombre, datos.codigo_barras, datos.id_categoria, datos.id_marca,
           datos.descripcion, datos.precio_unitario, datos.stock, datos.fecha_vencimiento,
           datos.tipo_presentacion, datos.cantidad_presentacion, simboloUnidadMedida, datos.activo, datos.sku]
        );
        if (result.rowCount > 0) {
          resultados.actualizados++;
          cantidadStockAgregada = datos.stock; // Stock agregado desde Excel
        }
      }
    } else if (yaExiste) {
      // Obtener el id_producto antes de actualizar
      const productoExistente = await cliente.query(
        'SELECT id_producto, stock FROM producto WHERE LOWER(nombre) = LOWER($1)',
        [datos.nombre]
      );
      
      if (productoExistente.rows.length > 0) {
        idProducto = productoExistente.rows[0].id_producto;
        const stockAnterior = productoExistente.rows[0].stock;
        
        // Actualizar por nombre - SUMAR stock al existente (no reemplazarlo)
        // Si el producto no tiene fecha_vencimiento, asignar la del Excel
        const result = await cliente.query(
          `UPDATE producto SET 
           sku = $1,
           codigo_barras = $2,
           id_categoria = $3,
           id_marca = $4,
           descripcion = $5,
           precio_unitario = $6,
           stock = stock + $7,
           fecha_vencimiento = COALESCE(fecha_vencimiento, $8),
           tipo_presentacion = $9,
           cantidad_presentacion = $10,
           unidad_medida = $11,
           activo = $12,
           updated_at = NOW()
           WHERE LOWER(nombre) = LOWER($13)`,
          [datos.sku, datos.codigo_barras, datos.id_categoria, datos.id_marca,
           datos.descripcion, datos.precio_unitario, datos.stock, datos.fecha_vencimiento,
           datos.tipo_presentacion, datos.cantidad_presentacion, simboloUnidadMedida, datos.activo, datos.nombre]
        );
        if (result.rowCount > 0) {
          resultados.actualizados++;
          cantidadStockAgregada = datos.stock; // Stock agregado desde Excel
        }
      }
    } else {
      // Insertar nuevo
      const result = await cliente.query(
        `INSERT INTO producto (nombre, sku, codigo_barras, id_categoria, id_marca, descripcion, 
          precio_unitario, stock, fecha_vencimiento, tipo_presentacion, cantidad_presentacion, unidad_medida, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id_producto`,
        [datos.nombre, datos.sku, datos.codigo_barras, datos.id_categoria, datos.id_marca,
         datos.descripcion, datos.precio_unitario, datos.stock, datos.fecha_vencimiento,
         datos.tipo_presentacion, datos.cantidad_presentacion, simboloUnidadMedida, datos.activo]
      );
      if (result.rows.length > 0) {
        idProducto = result.rows[0].id_producto;
        resultados.creados++;
        cantidadStockAgregada = datos.stock; // Stock inicial desde Excel
      }
    }

    // Crear movimiento de inventario si hay stock agregado (usando la misma conexión de la transacción)
    if (idProducto && cantidadStockAgregada > 0) {
      try {
        // Generar el siguiente número de lote
        let numeroLote;
        if (contadorLote !== null) {
          // Usar contador proporcionado (para cargas múltiples en la misma transacción)
          const hoy = new Date();
          const año = hoy.getFullYear();
          const mes = String(hoy.getMonth() + 1).padStart(2, '0');
          const dia = String(hoy.getDate()).padStart(2, '0');
          const fechaFormato = `${año}${mes}${dia}`;
          numeroLote = `LOTE-${fechaFormato}-${String(contadorLote).padStart(6, '0')}`;
        } else {
          // Generar nuevo número de lote (para cargas individuales)
          numeroLote = await CargaController.generarSiguienteNumeroLote(cliente);
        }
        
        await cliente.query(
          `INSERT INTO inventario_movimiento 
           (producto_id, tipo, cantidad, signo, referencia, usuario_id, observacion, fecha_vencimiento, numero_lote)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            idProducto,
            'AJUSTE_ENTRADA',
            cantidadStockAgregada,
            1,
            'Carga desde Excel',
            usuarioId,
            `Stock cargado desde Excel: ${cantidadStockAgregada} unidades`,
            datos.fecha_vencimiento || null,
            numeroLote
          ]
        );
      } catch (error) {
        console.error(`Error al crear movimiento de inventario para producto ${idProducto}:`, error.message);
        // No lanzar error para no interrumpir la carga
      }
    }
  }

  // Generar plantilla Excel
  static async generarPlantilla(req, res, next) {
    let cliente = null;
    try {
      cliente = await pool.connect();
      const { tipo } = req.params;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Datos');
      
      // Crear hoja de catálogos
      const catalogosSheet = workbook.addWorksheet('Catálogos');

      let headers = [];
      let ejemplosFilas = [];

      switch (tipo) {
        case 'proveedores':
          headers = ['Nombre', 'Apellido', 'Teléfono', 'Email', 'Dirección', 'Empresa', 'Activo'];
          ejemplosFilas = [
            ['Juan', 'González', '22345678', 'juan@farmaciacentral.com', 'Av. Principal 123', 'Farmacia Central S.A.', 'Sí'],
            ['Carlos', 'Ramírez', '22345679', 'carlos@distribuidora.com', 'Calle 5 de Mayo 456', 'Distribuidora Médica Ltda.', 'Sí'],
            ['Ana', 'Martínez', '22345680', 'ana@labnacionales.com', 'Boulevard Industrial 789', 'Laboratorios Nacionales', 'Sí'],
            ['Pedro', 'Sánchez', '22345681', 'pedro@suministros.com', 'Zona Industrial Sector A', 'Suministros Farmacéuticos', 'Sí'],
            ['Laura', 'Fernández', '22345682', 'laura@proveedora.com', 'Calle Comercial 321', 'Proveedora de Medicamentos', 'No']
          ];
          break;
        case 'categorias':
          headers = ['Nombre', 'Descripción', 'Activo'];
          ejemplosFilas = [
            ['Analgésicos', 'Medicamentos para el dolor y fiebre', 'Sí'],
            ['Antibióticos', 'Medicamentos para tratar infecciones bacterianas', 'Sí'],
            ['Vitaminas', 'Suplementos vitamínicos y minerales', 'Sí'],
            ['Antihistamínicos', 'Medicamentos para alergias', 'Sí'],
            ['Antiinflamatorios', 'Medicamentos para reducir inflamación', 'Sí']
          ];
          break;
        case 'marcas':
          headers = ['Nombre', 'Descripción', 'Activo'];
          ejemplosFilas = [
            ['Bayer', 'Marca farmacéutica reconocida internacionalmente', 'Sí'],
            ['Pfizer', 'Laboratorio farmacéutico líder mundial', 'Sí'],
            ['GSK', 'GlaxoSmithKline - Medicamentos de calidad', 'Sí'],
            ['Novartis', 'Empresa farmacéutica suiza', 'Sí'],
            ['Sanofi', 'Laboratorio farmacéutico francés', 'Sí']
          ];
          break;
        case 'presentaciones':
          headers = ['Nombre', 'Descripción', 'Activo'];
          ejemplosFilas = [
            ['Tabletas', 'Medicamentos en forma de tabletas sólidas', 'Sí'],
            ['Cápsulas', 'Medicamentos en forma de cápsulas', 'Sí'],
            ['Jarabe', 'Medicamentos en forma líquida (jarabe)', 'Sí'],
            ['Inyección', 'Medicamentos inyectables', 'Sí'],
            ['Gotas', 'Medicamentos en forma de gotas', 'Sí']
          ];
          break;
        case 'unidades-medida':
          headers = ['Nombre', 'Símbolo', 'Descripción', 'Activo'];
          ejemplosFilas = [
            ['Mililitros', 'ml', 'Unidad de volumen líquido', 'Sí'],
            ['Gramos', 'g', 'Unidad de masa', 'Sí'],
            ['Tabletas', 'tabletas', 'Unidad de dosificación para tabletas', 'Sí'],
            ['Cápsulas', 'cápsulas', 'Unidad de dosificación para cápsulas', 'Sí'],
            ['Unidades', 'unidades', 'Unidades de conteo', 'Sí']
          ];
          break;
        case 'productos':
          headers = ['Nombre', 'SKU', 'Código de Barras', 'Categoría', 'Marca', 'Descripción', 'Precio Unitario', 'Stock', 'Tipo de Presentación', 'Cantidad de Presentación', 'Unidad de Medida', 'Activo'];
          ejemplosFilas = [
            ['Paracetamol 500mg', 'PAR500-001', '1234567890123', 'Analgésicos', 'Bayer', 'Analgésico y antipirético', '5.50', '100', 'Tabletas', '20', 'tabletas', 'Sí'],
            ['Amoxicilina 500mg', 'AMO500-001', '1234567890124', 'Antibióticos', 'Pfizer', 'Antibiótico de amplio espectro', '12.75', '50', 'Cápsulas', '10', 'cápsulas', 'Sí'],
            ['Vitamina C 1000mg', 'VIT1000-001', '1234567890125', 'Vitaminas', 'GSK', 'Suplemento vitamínico', '8.90', '75', 'Tabletas', '30', 'tabletas', 'Sí'],
            ['Jarabe para la Tos', 'JAR-TOS-001', '1234567890126', 'Antihistamínicos', 'Novartis', 'Jarabe expectorante', '15.25', '30', 'Jarabe', '120', 'ml', 'Sí'],
            ['Ibuprofeno 400mg', 'IBU400-001', '1234567890127', 'Antiinflamatorios', 'Sanofi', 'Antiinflamatorio no esteroideo', '6.50', '80', 'Tabletas', '20', 'tabletas', 'No']
          ];
          break;
        default:
          return res.status(400).json({ ok: false, mensaje: 'Tipo de plantilla no válido' });
      }

      // Agregar encabezados
      worksheet.addRow(headers);
      
      // Estilizar encabezados
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Agregar filas de ejemplo (mínimo 5)
      ejemplosFilas.forEach(fila => {
        worksheet.addRow(fila);
      });
      
      // Agregar nota sobre el campo Activo (personalizada según tipo)
      const notaRow = worksheet.addRow([]);
      const notaCell = worksheet.getCell(notaRow.number, 1);
      
      let notaTexto = '⚠️ IMPORTANTE: Esta fila con instrucciones DEBE SER ELIMINADA antes de cargar el archivo, ya que representa un error al procesarlo. El campo "Activo" debe contener "Sí" o "No" (sin tildes también funciona: Si/No). Puede eliminar estas filas de ejemplo y agregar sus propios datos.';
      
      if (tipo === 'proveedores') {
        notaTexto = '⚠️ IMPORTANTE: Esta fila con instrucciones DEBE SER ELIMINADA antes de cargar el archivo, ya que representa un error al procesarlo. Los campos "Nombre", "Apellido" y "Email" son OBLIGATORIOS y no pueden estar vacíos. "Teléfono", "Dirección" y "Empresa" son opcionales. "Activo" debe ser "Sí" o "No" (por defecto "Sí" si está vacío). El email debe tener un formato válido (ejemplo@dominio.com).';
      } else if (tipo === 'productos') {
        notaTexto = '⚠️ IMPORTANTE: Esta fila con instrucciones DEBE SER ELIMINADA antes de cargar el archivo, ya que representa un error al procesarlo. Los campos "Nombre" y "Categoría" son OBLIGATORIOS. "Marca" es OPCIONAL. Use los nombres EXACTOS de "Categoría" y "Marca" que aparecen en la hoja "Catálogos". "Precio Unitario" y "Stock" deben ser números (por defecto 0). "Activo" debe ser "Sí" o "No" (por defecto "Sí").';
      } else if (tipo === 'unidades-medida') {
        notaTexto = '⚠️ IMPORTANTE: Esta fila con instrucciones DEBE SER ELIMINADA antes de cargar el archivo, ya que representa un error al procesarlo. Los campos "Nombre" y "Símbolo" son OBLIGATORIOS. "Nombre" máximo 20 caracteres, "Símbolo" máximo 10 caracteres. "Activo" debe ser "Sí" o "No" (por defecto "Sí").';
      } else if (tipo === 'categorias' || tipo === 'marcas' || tipo === 'presentaciones') {
        notaTexto = '⚠️ IMPORTANTE: Esta fila con instrucciones DEBE SER ELIMINADA antes de cargar el archivo, ya que representa un error al procesarlo. El campo "Nombre" es OBLIGATORIO. "Descripción" es opcional. "Activo" debe ser "Sí" o "No" (por defecto "Sí").';
      }
      
      notaCell.value = notaTexto;
      notaCell.font = { italic: true, bold: true, color: { argb: 'FFFF0000' } }; // Rojo para destacar
      notaCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF4E6' } // Fondo amarillo claro
      };
      notaCell.alignment = { wrapText: true };
      worksheet.mergeCells(notaRow.number, 1, notaRow.number, headers.length);

      // Ajustar ancho de columnas
      headers.forEach((header, index) => {
        worksheet.getColumn(index + 1).width = Math.max(header.length, 20);
      });

      // Agregar catálogos a la hoja de catálogos (solo si hay cliente disponible)
      if (cliente) {
        try {
          await CargaController.agregarCatalogosAExcel(catalogosSheet, cliente);
        } catch (error) {
          console.error('Error al agregar catálogos a la plantilla:', error);
          // Continuar sin los catálogos si hay error
          const errorRow = catalogosSheet.addRow([]);
          const errorCell = catalogosSheet.getCell(errorRow.number, 1);
          errorCell.value = 'No se pudieron cargar los catálogos. Por favor, consulte la pestaña "Catálogos" en el sistema.';
          errorCell.font = { italic: true, color: { argb: 'FFFF0000' } };
          catalogosSheet.mergeCells(errorRow.number, 1, errorRow.number, 4);
        }
      }

      // Configurar respuesta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=plantilla-${tipo}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error al generar plantilla:', error);
      if (!res.headersSent) {
        next(error);
      }
    } finally {
      if (cliente) {
        cliente.release();
      }
    }
  }

  // Agregar catálogos a la hoja de Excel
  static async agregarCatalogosAExcel(worksheet, cliente) {
    if (!cliente) {
      throw new Error('Cliente de base de datos no disponible');
    }
    
    let rowNumber = 1;

    // Título principal
    const titleCell = worksheet.getCell(rowNumber, 1);
    titleCell.value = 'CATÁLOGOS DISPONIBLES - Use estos valores EXACTOS en su carga de datos';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF0000FF' } };
    titleCell.alignment = { horizontal: 'center' };
    worksheet.mergeCells(rowNumber, 1, rowNumber, 4);
    rowNumber += 2;

    // Instrucciones
    const instruccionesCell = worksheet.getCell(rowNumber, 1);
    instruccionesCell.value = 'INSTRUCCIONES: Copie y pegue los valores EXACTOS de las tablas de abajo en su hoja de datos. Los nombres deben coincidir EXACTAMENTE (mayúsculas, minúsculas, tildes, espacios).';
    instruccionesCell.font = { italic: true, color: { argb: 'FF666666' } };
    instruccionesCell.alignment = { wrapText: true };
    worksheet.mergeCells(rowNumber, 1, rowNumber, 4);
    rowNumber += 2;

    // CATEGORÍAS
    rowNumber = await CargaController.agregarCatalogo(worksheet, cliente, 'Categorías', 
      'SELECT nombre FROM categoria WHERE activo = true ORDER BY nombre',
      ['Nombre de Categoría'],
      rowNumber,
      'Use estos nombres EXACTOS en la columna "Categoría" al cargar productos'
    );

    // MARCAS
    rowNumber = await CargaController.agregarCatalogo(worksheet, cliente, 'Marcas',
      'SELECT nombre FROM marca WHERE activo = true ORDER BY nombre',
      ['Nombre de Marca'],
      rowNumber,
      'Use estos nombres EXACTOS en la columna "Marca" al cargar productos'
    );

    // PRESENTACIONES
    rowNumber = await CargaController.agregarCatalogo(worksheet, cliente, 'Presentaciones',
      'SELECT nombre FROM presentacion WHERE activo = true ORDER BY nombre',
      ['Nombre de Presentación'],
      rowNumber,
      'Use estos nombres EXACTOS en la columna "Tipo de Presentación" al cargar productos'
    );

    // UNIDADES DE MEDIDA
    rowNumber = await CargaController.agregarCatalogo(worksheet, cliente, 'Unidades de Medida',
      'SELECT nombre, simbolo FROM unidad_medida WHERE activo = true ORDER BY nombre',
      ['Nombre', 'Símbolo'],
      rowNumber,
      'Use el nombre o símbolo EXACTO en la columna "Unidad de Medida" al cargar productos'
    );

    // Ajustar ancho de columnas
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 50;
  }

  // Método helper para agregar un catálogo
  static async agregarCatalogo(worksheet, cliente, titulo, query, columnas, startRow, nota) {
    if (!cliente) {
      throw new Error('Cliente de base de datos no disponible');
    }
    
    let rowNumber = startRow;

    // Título del catálogo
    const titleCell = worksheet.getCell(rowNumber, 1);
    titleCell.value = titulo;
    titleCell.font = { bold: true, size: 12, color: { argb: 'FF0066CC' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F2FF' }
    };
    worksheet.mergeCells(rowNumber, 1, rowNumber, columnas.length);
    rowNumber++;

    // Encabezados
    const headerRow = worksheet.getRow(rowNumber);
    columnas.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    rowNumber++;

    // Datos
    let result;
    try {
      result = await cliente.query(query);
    } catch (error) {
      console.error(`Error al consultar catálogo ${titulo}:`, error);
      // Si hay error, agregar mensaje en lugar de los datos
      const errorRow = worksheet.getRow(rowNumber);
      errorRow.getCell(1).value = `Error al cargar ${titulo}: ${error.message}`;
      errorRow.getCell(1).font = { italic: true, color: { argb: 'FFFF0000' } };
      rowNumber++;
      rowNumber += 2;
      return rowNumber;
    }
    
    if (result && result.rows) {
      result.rows.forEach((row) => {
        const dataRow = worksheet.getRow(rowNumber);
        if (columnas.length === 1) {
          dataRow.getCell(1).value = row.nombre || '';
        } else {
          dataRow.getCell(1).value = row.nombre || '';
          dataRow.getCell(2).value = row.simbolo || '';
        }
        rowNumber++;
      });
    }

    // Nota
    if (nota) {
      const notaCell = worksheet.getCell(rowNumber, 1);
      notaCell.value = nota;
      notaCell.font = { italic: true, size: 9, color: { argb: 'FF666666' } };
      notaCell.alignment = { wrapText: true };
      worksheet.mergeCells(rowNumber, 1, rowNumber, columnas.length);
      rowNumber++;
    }

    rowNumber += 2; // Espacio entre catálogos
    return rowNumber;
  }
}

module.exports = CargaController;

