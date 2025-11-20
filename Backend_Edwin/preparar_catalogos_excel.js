const ExcelJS = require('exceljs');
const path = require('path');
const { pool } = require('./src/config/db');

async function prepararCatalogos() {
  let cliente = null;
  try {
    console.log('🔍 Analizando Excel para preparar catálogos...');
    console.log('='.repeat(80));
    
    // Paso 1: Leer el Excel y extraer categorías y marcas únicas
    const archivoPath = path.join(__dirname, '../FrontEnd_Edwin/subir/plantilla-productos (1).xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(archivoPath);
    
    const worksheet = workbook.worksheets[0];
    const headers = [];
    worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
      headers[colNumber] = cell.value?.toString().trim().toLowerCase() || '';
    });
    
    // Encontrar columnas de categoría y marca
    let columnaCategoria = null;
    let columnaMarca = null;
    
    for (let colNum = 1; colNum <= headers.length; colNum++) {
      const header = headers[colNum];
      if (header && (
        header.includes('categoría') || 
        header.includes('categoria') ||
        header === 'categoría'
      )) {
        columnaCategoria = colNum;
      }
      if (header && (
        header.includes('marca') ||
        header === 'marca'
      )) {
        columnaMarca = colNum;
      }
    }
    
    if (!columnaCategoria) {
      throw new Error('No se encontró la columna de categoría');
    }
    if (!columnaMarca) {
      throw new Error('No se encontró la columna de marca');
    }
    
    console.log(`✅ Columna de categoría encontrada: ${columnaCategoria}`);
    console.log(`✅ Columna de marca encontrada: ${columnaMarca}`);
    
    // Extraer categorías y marcas únicas
    const categorias = new Set();
    const marcas = new Set();
    
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      // Verificar si la fila está vacía
      let filaVacia = true;
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
          filaVacia = false;
        }
      });
      
      if (filaVacia) continue;
      
      // Extraer categoría
      const cellCategoria = row.getCell(columnaCategoria);
      if (cellCategoria && cellCategoria.value !== null && cellCategoria.value !== undefined && cellCategoria.value !== '') {
        const categoria = cellCategoria.value.toString().trim();
        if (categoria) {
          categorias.add(categoria);
        }
      }
      
      // Extraer marca
      const cellMarca = row.getCell(columnaMarca);
      if (cellMarca && cellMarca.value !== null && cellMarca.value !== undefined && cellMarca.value !== '') {
        const marca = cellMarca.value.toString().trim();
        if (marca) {
          marcas.add(marca);
        }
      }
    }
    
    console.log(`\n📋 Categorías encontradas en el Excel: ${categorias.size}`);
    const categoriasArray = Array.from(categorias).sort();
    categoriasArray.forEach((c, i) => {
      console.log(`   ${i + 1}. "${c}"`);
    });
    
    console.log(`\n📋 Marcas encontradas en el Excel: ${marcas.size}`);
    const marcasArray = Array.from(marcas).sort();
    marcasArray.forEach((m, i) => {
      console.log(`   ${i + 1}. "${m}"`);
    });
    
    // Paso 2: Conectar a la base de datos
    console.log('\n🔌 Conectando a la base de datos...');
    cliente = await pool.connect();
    console.log('✅ Conexión establecida');
    
    // Paso 3: Verificar y crear categorías faltantes
    console.log('\n🔍 Verificando categorías existentes...');
    const categoriasExistentes = new Set();
    const resultCategorias = await cliente.query(
      'SELECT nombre FROM categoria WHERE activo = true'
    );
    
    resultCategorias.rows.forEach(row => {
      categoriasExistentes.add(row.nombre.toLowerCase().trim());
    });
    
    console.log(`✅ Categorías existentes en BD: ${resultCategorias.rows.length}`);
    
    const categoriasFaltantes = categoriasArray.filter(c => {
      return !categoriasExistentes.has(c.toLowerCase().trim());
    });
    
    console.log(`\n📝 Categorías faltantes: ${categoriasFaltantes.length}`);
    
    let categoriasCreadas = 0;
    if (categoriasFaltantes.length > 0) {
      categoriasFaltantes.forEach((c, i) => {
        console.log(`   ${i + 1}. "${c}"`);
      });
      
      console.log('\n💾 Creando categorías faltantes...');
      for (const categoriaNombre of categoriasFaltantes) {
        try {
          // Verificar si existe pero está inactiva
          const existeInactiva = await cliente.query(
            'SELECT id_categoria FROM categoria WHERE LOWER(nombre) = LOWER($1)',
            [categoriaNombre]
          );
          
          if (existeInactiva.rows.length > 0) {
            // Reactivar
            await cliente.query(
              'UPDATE categoria SET activo = true, updated_at = NOW() WHERE id_categoria = $1',
              [existeInactiva.rows[0].id_categoria]
            );
            console.log(`   ✅ Reactivada: "${categoriaNombre}"`);
            categoriasCreadas++;
          } else {
            // Crear nueva
            await cliente.query(
              'INSERT INTO categoria (nombre, descripcion, activo) VALUES ($1, $2, $3)',
              [categoriaNombre, `Categoría: ${categoriaNombre}`, true]
            );
            console.log(`   ✅ Creada: "${categoriaNombre}"`);
            categoriasCreadas++;
          }
        } catch (error) {
          console.error(`   ❌ Error al crear "${categoriaNombre}": ${error.message}`);
        }
      }
    } else {
      console.log('✅ Todas las categorías ya existen en la base de datos');
    }
    
    // Paso 4: Verificar y crear marcas faltantes
    console.log('\n🔍 Verificando marcas existentes...');
    const marcasExistentes = new Set();
    const resultMarcas = await cliente.query(
      'SELECT nombre FROM marca WHERE activo = true'
    );
    
    resultMarcas.rows.forEach(row => {
      marcasExistentes.add(row.nombre.toLowerCase().trim());
    });
    
    console.log(`✅ Marcas existentes en BD: ${resultMarcas.rows.length}`);
    
    const marcasFaltantes = marcasArray.filter(m => {
      return !marcasExistentes.has(m.toLowerCase().trim());
    });
    
    console.log(`\n📝 Marcas faltantes: ${marcasFaltantes.length}`);
    
    let marcasCreadas = 0;
    if (marcasFaltantes.length > 0) {
      marcasFaltantes.forEach((m, i) => {
        console.log(`   ${i + 1}. "${m}"`);
      });
      
      console.log('\n💾 Creando marcas faltantes...');
      for (const marcaNombre of marcasFaltantes) {
        try {
          // Verificar si existe pero está inactiva
          const existeInactiva = await cliente.query(
            'SELECT id_marca FROM marca WHERE LOWER(nombre) = LOWER($1)',
            [marcaNombre]
          );
          
          if (existeInactiva.rows.length > 0) {
            // Reactivar
            await cliente.query(
              'UPDATE marca SET activo = true, updated_at = NOW() WHERE id_marca = $1',
              [existeInactiva.rows[0].id_marca]
            );
            console.log(`   ✅ Reactivada: "${marcaNombre}"`);
            marcasCreadas++;
          } else {
            // Crear nueva
            await cliente.query(
              'INSERT INTO marca (nombre, descripcion, activo) VALUES ($1, $2, $3)',
              [marcaNombre, `Marca: ${marcaNombre}`, true]
            );
            console.log(`   ✅ Creada: "${marcaNombre}"`);
            marcasCreadas++;
          }
        } catch (error) {
          console.error(`   ❌ Error al crear "${marcaNombre}": ${error.message}`);
        }
      }
    } else {
      console.log('✅ Todas las marcas ya existen en la base de datos');
    }
    
    console.log('\n📊 RESUMEN FINAL:');
    console.log('='.repeat(80));
    console.log(`   Total de categorías en Excel: ${categoriasArray.length}`);
    console.log(`   Categorías creadas/reactivadas: ${categoriasCreadas}`);
    console.log(`   Total de marcas en Excel: ${marcasArray.length}`);
    console.log(`   Marcas creadas/reactivadas: ${marcasCreadas}`);
    console.log('\n✅ Proceso completado');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (cliente) {
      cliente.release();
    }
  }
}

// Ejecutar
prepararCatalogos();

