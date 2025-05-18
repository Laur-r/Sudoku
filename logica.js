// Estado del juego
export let tablero = Array.from({ length: 9 }, () => Array(9).fill('-'));
export let historial = [];       // Todas las jugadas realizadas
export let pilaRehacer = [];     // Jugadas deshechas pendientes de rehacer
export let historialCompleto = []; // Historial completo de todas las acciones

// Validar si un número se puede insertar en una celda
export function esJugadaValida(f, c, num) {
  num = String(num);
  // Validar fila
  for (let i = 0; i < 9; i++) {
    if (tablero[f][i] === num) {
      return { valido: false, conflicto: 'fila' };
    }
  }
  
  // Validar columna
  for (let i = 0; i < 9; i++) {
    if (tablero[i][c] === num) {
      return { valido: false, conflicto: 'columna' };
    }
  }

  // Validar región 3x3
  const startF = Math.floor(f / 3) * 3;
  const startC = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (tablero[startF + i][startC + j] === num) {
        return { valido: false, conflicto: 'region' };
      }
    }
  }

  return { valido: true };
}

// Hacer jugada si es válida
export function hacerJugada(f, c, num) {
  num = String(num);
  if (tablero[f][c] !== '-') {
    return { exito: false, mensaje: 'Celda ya ocupada' };
  }

  const validacion = esJugadaValida(f, c, num);
  if (validacion.valido) {
    const jugadaAnterior = tablero[f][c];
    tablero[f][c] = num;
    
    const jugada = { 
      f, 
      c, 
      num, 
      anterior: jugadaAnterior,
      tipo: 'Nueva',
      timestamp: new Date().toISOString()
    };
    
    historial.push(jugada);
    historialCompleto.push(jugada);
    pilaRehacer.length = 0;
    
    return { 
      exito: true, 
      mensaje: `Número ${num} insertado correctamente`,
      completo: estaCompleto()
    };
  } else {
    return { 
      exito: false, 
      mensaje: `El número ${num} ya existe en la ${validacion.conflicto}` 
    };
  }
}

// Deshacer última jugada
export function deshacer() {
  if (historial.length === 0) return false;
  
  const jugada = historial.pop();
  tablero[jugada.f][jugada.c] = jugada.anterior;
  
  const accionDeshacer = {
    ...jugada,
    tipo: 'Deshacer',
    timestamp: new Date().toISOString()
  };
  
  pilaRehacer.push(jugada);
  historialCompleto.push(accionDeshacer);
  
  return true;
}

// Rehacer última jugada deshecha
export function rehacer() {
  if (pilaRehacer.length === 0) return false;
  
  const jugada = pilaRehacer.pop();
  tablero[jugada.f][jugada.c] = jugada.num;
  
  const accionRehacer = {
    ...jugada,
    tipo: 'Rehacer',
    timestamp: new Date().toISOString()
  };
  
  historial.push(jugada);
  historialCompleto.push(accionRehacer);
  
  return true;
}

// Sugerir número válido para una celda vacía
export function sugerirNumero(f, c) {
  if (tablero[f][c] !== '-') return null;

  // Primero, intentamos encontrar un número único posible
  const posibles = [];
  for (let num = 1; num <= 9; num++) {
    if (esJugadaValida(f, c, String(num)).valido) {
      posibles.push(num);
    }
  }

  if (posibles.length === 0) return null;
  
  // Estrategia 1: Si solo hay una posibilidad, la devolvemos
  if (posibles.length === 1) return posibles[0];
  
  // Estrategia 2: Buscar números que solo puedan ir en esta celda en su región
  const startF = Math.floor(f / 3) * 3;
  const startC = Math.floor(c / 3) * 3;
  
  for (const num of posibles) {
    let unicoEnRegion = true;
    for (let i = 0; i < 3 && unicoEnRegion; i++) {
      for (let j = 0; j < 3 && unicoEnRegion; j++) {
        const celdaF = startF + i;
        const celdaC = startC + j;
        
        if ((celdaF !== f || celdaC !== c) && tablero[celdaF][celdaC] === '-') {
          if (esJugadaValida(celdaF, celdaC, String(num)).valido) {
            unicoEnRegion = false;
          }
        }
      }
    }
    
    if (unicoEnRegion) return num;
  }
  
  // Si no encontramos un único candidato, devolvemos el primero posible
  return posibles[0];
}

// Verificar si el tablero está completo
export function estaCompleto() {
  for (let f = 0; f < 9; f++) {
    for (let c = 0; c < 9; c++) {
      if (tablero[f][c] === '-') return false;
    }
  }
  return true;
}

// Obtener historial de jugadas
export function obtenerHistorial() {
  return [...historialCompleto];
}

export function cargarTableroInicial(config) {
  // Limpiar el tablero y el historial
  tablero = Array.from({ length: 9 }, () => Array(9).fill('-'));
  historial = [];
  pilaRehacer = [];
  historialCompleto = [];

  // Cargar la configuración inicial
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      tablero[i][j] = config[i][j];
    }
  }
}