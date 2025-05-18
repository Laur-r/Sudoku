console.log("main.js cargado");

import { 
  tablero, 
  hacerJugada, 
  deshacer, 
  rehacer, 
  sugerirNumero, 
  estaCompleto,
  obtenerHistorial,
  cargarTableroInicial 
} from './logica.js';

const divTablero = document.getElementById('tablero');
const mensaje = document.getElementById('mensaje');
let celdaSeleccionada = null; // Para guardar la última celda clickeada

// Renderiza el tablero visualmente
function renderizarTablero() {
  divTablero.innerHTML = '';
  
  // Obtener las celdas fijas (las que venían con número al cargar)
  const celdasFijas = [];
  for (let f = 0; f < 9; f++) {
    for (let c = 0; c < 9; c++) {
      if (tablero[f][c] !== '-') {
        celdasFijas.push(`${f},${c}`);
      }
    }
  }

  for (let f = 0; f < 9; f++) {
    for (let c = 0; c < 9; c++) {
      const celda = document.createElement('div');
      celda.className = 'celda';
      celda.textContent = tablero[f][c] !== '-' ? tablero[f][c] : '';
      celda.dataset.f = f;
      celda.dataset.c = c;

      // Verificar si es una celda fija (número inicial)
      if (celdasFijas.includes(`${f},${c}`)) {
        celda.classList.add('fija');
      }

      celda.addEventListener('click', () => {
        // Si es celda fija, no hacer nada
        if (celda.classList.contains('fija')) {
          mensaje.textContent = 'No puedes modificar números iniciales';
          return;
        }

        // Quitar selección anterior
        document.querySelectorAll('.celda').forEach(c => {
          c.classList.remove('seleccionada');
        });
        
        // Seleccionar nueva celda
        celda.classList.add('seleccionada');
        celdaSeleccionada = { f, c };
        
        if (numeroSeleccionado !== null) {
          const resultado = hacerJugada(f, c, numeroSeleccionado);
          
          if (resultado.exito) {
            renderizarTablero();
            mensaje.textContent = resultado.mensaje;
            
            if (resultado.completo) {
              setTimeout(() => {
                alert('¡Felicidades! ¡Has completado el Sudoku!');
              }, 100);
            }
          } else {
            mensaje.textContent = resultado.mensaje;
            // Animación de error
            celda.classList.add('error');
            setTimeout(() => celda.classList.remove('error'), 500);
          }
        } else {
          mensaje.textContent = `Celda [${f+1},${c+1}] seleccionada. Elige un número.`;
        }
      });

      divTablero.appendChild(celda);
    }
  }
}

// Función para sugerir movimiento
function sugerirMovimiento() {
  if (!celdaSeleccionada) {
    mensaje.textContent = 'Por favor, selecciona una celda vacía primero';
    return;
  }
  
  const { f, c } = celdaSeleccionada;
  
  if (tablero[f][c] !== '-') {
    mensaje.textContent = 'La celda seleccionada ya tiene un número';
    return;
  }
  
  const sugerencia = sugerirNumero(f, c);
  
  if (sugerencia) {
    mensaje.textContent = `Sugerencia para [${f+1},${c+1}]: ${sugerencia}`;
    
    // Resaltar el número sugerido en el teclado
    document.querySelectorAll('.boton-num').forEach(boton => {
      boton.classList.remove('sugerido');
      if (parseInt(boton.textContent) === sugerencia) {
        boton.classList.add('sugerido');
      }
    });
  } else {
    mensaje.textContent = `No hay números válidos para [${f+1},${c+1}]`;
  }
}


// Botones de control
document.getElementById('btn-deshacer').addEventListener('click', () => {
  if (deshacer()) {
    renderizarTablero();
    mensaje.textContent = 'Última jugada deshecha.';
  } else {
    mensaje.textContent = 'No hay jugadas para deshacer.';
  }
});

document.getElementById('btn-rehacer').addEventListener('click', () => {
  if (rehacer()) {
    renderizarTablero();
    mensaje.textContent = 'Última jugada rehecha.';
  } else {
    mensaje.textContent = 'No hay jugadas para rehacer.';
  }
});

// Función para sugerir una jugada completa (celda + número)
function sugerirJugada() {
  // Buscar celdas vacías
  const celdasVacias = [];
  for (let f = 0; f < 9; f++) {
    for (let c = 0; c < 9; c++) {
      if (tablero[f][c] === '-') {
        celdasVacias.push({f, c});
      }
    }
  }

  if (celdasVacias.length === 0) {
    mensaje.textContent = '¡El tablero ya está completo!';
    return;
  }

  // Ordenar aleatoriamente para variedad
  celdasVacias.sort(() => Math.random() - 0.5);

  // Buscar una celda con sugerencia válida
  for (const {f, c} of celdasVacias) {
    const sugerencia = sugerirNumero(f, c);
    if (sugerencia) {
      // Resaltar la celda sugerida
      document.querySelectorAll('.celda').forEach(celda => {
        celda.classList.remove('sugerida');
        if (parseInt(celda.dataset.f) === f && parseInt(celda.dataset.c) === c) {
          celda.classList.add('sugerida');
        }
      });

      // Resaltar el número sugerido
      document.querySelectorAll('.boton-num').forEach(boton => {
        boton.classList.remove('sugerido');
        if (parseInt(boton.textContent) === sugerencia) {
          boton.classList.add('sugerido');
        }
      });

      mensaje.textContent = `Sugerencia: Coloca ${sugerencia} en [${f+1}, ${c+1}]`;
      return;
    }
  }

  mensaje.textContent = 'No se encontraron jugadas sugeridas';
}


// Cargar tablero inicial desde un archivo
function cargarTableroDesdeArchivo(ruta = 'tablero.txt') {
  fetch(ruta)
    .then(response => response.text())
    .then(texto => {
      const lineas = texto.trim().split('\n');
      const config = lineas.map(l => l.trim().split(''));
      cargarTableroInicial(config);
      renderizarSelectorNumeros();
      renderizarTablero();
      mensaje.textContent = 'Tablero inicial cargado automáticamente.';
    })
    .catch(err => {
      mensaje.textContent = 'Error cargando tablero inicial.';
      console.error(err);
    });
}

let numeroSeleccionado = null;

function renderizarSelectorNumeros() {
  const selector = document.getElementById('selector-numeros');
  selector.innerHTML = '';

  for (let i = 1; i <= 9; i++) {
    const boton = document.createElement('button');
    boton.textContent = i;
    boton.className = 'boton-num';
    boton.addEventListener('click', () => {
      numeroSeleccionado = i;
      // Marcar el botón seleccionado
      document.querySelectorAll('.boton-num').forEach(btn => btn.classList.remove('seleccionado'));
      boton.classList.add('seleccionado');
    });
    selector.appendChild(boton);
  }
}

// Configurar todos los botones de control
function configurarBotones() {
  document.getElementById('btn-deshacer').addEventListener('click', () => {
    if (deshacer()) {
      renderizarTablero();
      mensaje.textContent = 'Última jugada deshecha.';
    } else {
      mensaje.textContent = 'No hay jugadas para deshacer.';
    }
  });

  document.getElementById('btn-rehacer').addEventListener('click', () => {
    if (rehacer()) {
      renderizarTablero();
      mensaje.textContent = 'Última jugada rehecha.';
    } else {
      mensaje.textContent = 'No hay jugadas para rehacer.';
    }
  });

  // Configurar el botón de sugerir jugada
  document.getElementById('btn-sugerir').addEventListener('click', sugerirJugada);

  // Configurar el botón de historial
  document.getElementById('btn-historial').addEventListener('click', mostrarHistorial);
}

// Función para mostrar el historial (nueva implementación)
function mostrarHistorial() {
  const historial = obtenerHistorial();
  
  if (historial.length === 0) {
    mensaje.textContent = 'No hay jugadas en el historial';
    return;
  }
  
  // Crear una representación simple del historial
  let historialTexto = 'Historial de Jugadas:\n';
  historial.forEach((jugada, index) => {
    historialTexto += `${index + 1}. [F${jugada.f + 1},C${jugada.c + 1}] = ${jugada.num || '-'} (${jugada.tipo})\n`;
  });
  
  alert(historialTexto); // Puedes reemplazar esto con un modal más elegante
}

// Llamar a configurarBotones después de que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  renderizarTablero();
  configurarBotones();
  renderizarSelectorNumeros();
  cargarTableroDesdeArchivo();
});


