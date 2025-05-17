console.log("main.js cargado");

import { tablero, hacerJugada, deshacer, rehacer } from './logica.js';

const divTablero = document.getElementById('tablero');
const mensaje = document.getElementById('mensaje');

// Renderiza el tablero visualmente
function renderizarTablero() {
  divTablero.innerHTML = '';
  for (let f = 0; f < 9; f++) {
    for (let c = 0; c < 9; c++) {
      const celda = document.createElement('div');
      celda.className = 'celda';
      celda.textContent = tablero[f][c] !== '-' ? tablero[f][c] : '';
      celda.dataset.f = f;
      celda.dataset.c = c;

      celda.addEventListener('click', () => {
        if (numeroSeleccionado !== null) {
          if (hacerJugada(f, c, numeroSeleccionado)) {
            renderizarTablero();
            mensaje.textContent = `Insertado ${numeroSeleccionado} en [${f + 1}, ${c + 1}]`;
          } else {
            mensaje.textContent = `Movimiento inválido en [${f + 1}, ${c + 1}]`;
          }
        }
      });

      divTablero.appendChild(celda);
    }
  }
}


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

renderizarTablero();
cargarTableroDesdeArchivo();
renderizarSelectorNumeros();
