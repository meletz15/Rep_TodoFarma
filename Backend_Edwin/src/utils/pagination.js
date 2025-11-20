// Función para construir consultas paginadas
const construirPaginacion = (pagina = 1, limite = 10) => {
  // Si limite es null, significa que se quieren todos los registros
  const offset = limite ? (pagina - 1) * limite : 0;
  return {
    offset,
    limite: limite !== null ? parseInt(limite) : null,
    pagina: parseInt(pagina)
  };
};

// Función para construir respuesta paginada
const construirRespuestaPaginada = (datos, total, pagina, limite) => {
  // Si no hay límite, significa que se devolvieron todos los registros
  const limiteNum = limite || total;
  const totalPaginas = limite ? Math.ceil(total / limiteNum) : 1;
  
  return {
    datos,
    paginacion: {
      pagina: parseInt(pagina),
      limite: limiteNum,
      total,
      totalPaginas,
      tieneSiguiente: limite ? pagina < totalPaginas : false,
      tieneAnterior: pagina > 1
    }
  };
};

// Función para validar parámetros de paginación
const validarPaginacion = (pagina, limite) => {
  const paginaNum = parseInt(pagina) || 1;
  let limiteNum = parseInt(limite) || 10;
  
  if (paginaNum < 1) {
    throw new Error('La página debe ser mayor a 0');
  }
  
  // Si el límite es >= 1000, tratarlo como "sin límite" para devolver todos los registros
  // Esto permite obtener todos los registros cuando se necesita
  if (limiteNum >= 1000) {
    limiteNum = null; // null significa sin límite
  } else if (limiteNum < 1) {
    throw new Error('El límite debe ser mayor a 0');
  }
  
  return { pagina: paginaNum, limite: limiteNum };
};

module.exports = {
  construirPaginacion,
  construirRespuestaPaginada,
  validarPaginacion
};
