#!/usr/bin/env node

/**
 * Generador de Hash de Contraseñas
 * Uso: node generar_hash.js [contraseña]
 * 
 * Si no se proporciona contraseña, se usará 'Admin123!' por defecto
 */

const bcrypt = require('bcrypt');

async function generarHash(contraseña) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(contraseña, saltRounds);
    
    console.log('\n' + '='.repeat(50));
    console.log('🔐 GENERADOR DE HASH DE CONTRASEÑA');
    console.log('='.repeat(50));
    console.log(`📝 Contraseña: ${contraseña}`);
    console.log(`🔑 Hash: ${hash}`);
    console.log('='.repeat(50));
    
    return hash;
  } catch (error) {
    console.error('❌ Error al generar hash:', error.message);
    return null;
  }
}

async function main() {
  let contraseña = process.argv[2];
  
  if (!contraseña) {
    contraseña = 'Admin123!';
    console.log('⚠️  No se proporcionó contraseña, usando: Admin123!');
  }
  
  try {
    await generarHash(contraseña);
  } catch (error) {
    console.error('❌ Error en el script:', error.message);
  }
}

// Verificar si bcrypt está instalado
try {
  require('bcrypt');
  main();
} catch (error) {
  console.error('❌ Error: bcrypt no está instalado');
  console.log('💡 Instala bcrypt con: npm install bcrypt');
  process.exit(1);
}
