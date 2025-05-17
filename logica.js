

// Estado del juego
export let tablero = Array.from({ length: 9 }, () => Array(9).fill('-'));

export let historial = [];       // Jugadas válidas realizadas
export let pilaRehacer = [];     // Jugadas deshechas pendientes de rehacer

// Validar si un número se puede insertar en una celda
export function esJugadaValida(f, c, num) {
  num = String(num);
  // Validar fila y columna
  for (let i = 0; i < 9; i++) {
    if (tablero[f][i] === num || tablero[i][c] === num) return false;
  }

  // Validar región 3x3
  const startF = Math.floor(f / 3) * 3;
  const startC = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (tablero[startF + i][startC + j] === num) return false;
    }
  }

  return true;
}

// Hacer jugada si es válida
export function hacerJugada(f, c, num) {
  num = String(num);
  if (tablero[f][c] !== '-') return false;

  if (esJugadaValida(f, c, num)) {
    tablero[f][c] = num;
    historial.push({ f, c, num, tipo: 'Nueva' });
    pilaRehacer.length = 0; // limpiar pila de rehacer
    return true;
  }

  return false;
}

// Deshacer última jugada
export function deshacer() {
  if (historial.length === 0) return false;
  const jugada = historial.pop();
  tablero[jugada.f][jugada.c] = '-';
  pilaRehacer.push({ ...jugada, tipo: 'Deshacer' });
  return true;
}

// Rehacer última jugada deshecha
export function rehacer() {
  if (pilaRehacer.length === 0) return false;
  const jugada = pilaRehacer.pop();
  tablero[jugada.f][jugada.c] = jugada.num;
  historial.push({ ...jugada, tipo: 'Rehacer' });
  return true;
}

// Sugerir número válido para una celda vacía
export function sugerirNumero(f, c) {
  if (tablero[f][c] !== '-') return null;

  for (let num = 1; num <= 9; num++) {
    if (esJugadaValida(f, c, String(num))) {
      return num;
    }
  }

  return null; // no hay sugerencia válida
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

export function cargarTableroInicial(config) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      tablero[i][j] = config[i][j];
    }
  }
}
