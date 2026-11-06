// Esperar a que todo el documento HTML esté cargado
document.addEventListener("DOMContentLoaded", function () {
  // ==============================================================
  // 1. VISTAS, PESTAÑAS Y FUNCIÓN PARA CAMBIAR DE PANTALLA
  // ==============================================================

  const todasLasVistas = document.querySelectorAll(".vista-seccion");
  const pestanas = document.querySelectorAll(".pestana-boton");
  const tituloVentana = document.getElementById("titulo-ventana");
  const textoAsistente = document.getElementById("texto-consejo-asistente");

  // Muestra una vista, marca la pestaña correspondiente (si hay) y cambia el título
  function mostrarVista(idVista, titulo) {
    // 1. Ocultar todas las vistas
    for (let i = 0; i < todasLasVistas.length; i++) {
      todasLasVistas[i].classList.remove("vista-activa");
    }

    // 2. Mostrar la vista pedida
    const vista = document.getElementById(idVista);
    if (vista) {
      vista.classList.add("vista-activa");
    }

    // 3. Marcar la pestaña que corresponde (si la vista no tiene pestaña, ninguna queda activa)
    for (let i = 0; i < pestanas.length; i++) {
      if (pestanas[i].dataset.seccion === idVista) {
        pestanas[i].classList.add("pestana-activa");
      } else {
        pestanas[i].classList.remove("pestana-activa");
      }
    }

    // 4. Cambiar el título de la ventana
    tituloVentana.textContent = "THRILLOTECA - " + titulo;
  }

  function cambiarConsejo(texto) {
    if (textoAsistente) {
      textoAsistente.textContent = texto;
    }
  }

  // ==============================================================
  // 2. NAVEGACIÓN DE LAS PESTAÑAS SUPERIORES
  // ==============================================================

  const titulosPorVista = {
    "seccion-inicio": "inicio",
    "seccion-biblioteca": "mi biblioteca",
    "seccion-resenas": "mis reseñas",
    "seccion-comentarios": "mis comentarios",
    "seccion-leer-tarde": "leer más tarde",
  };

  for (let i = 0; i < pestanas.length; i++) {
    pestanas[i].addEventListener("click", function () {
      const idVista = this.dataset.seccion;
      mostrarVista(idVista, titulosPorVista[idVista]);
    });
  }

  // Botones del menú lateral derecho (leer más tarde y explorar)
  const accesosDirectos = document.querySelectorAll(".acceso-directo");

  for (let i = 0; i < accesosDirectos.length; i++) {
    accesosDirectos[i].addEventListener("click", function () {
      const idVista = this.dataset.destino;
      mostrarVista(idVista, titulosPorVista[idVista]);
    });
  }

  // ==============================================================
  // 3. EXPLORAR Y FILTROS (SUSPENSO, TERROR, THRILLER)
  // ==============================================================

  const botonExplorar = document.getElementById("boton-explorar");

  if (botonExplorar) {
    botonExplorar.addEventListener("click", function () {
      mostrarVista("seccion-explorar", "explorar");
      cambiarConsejo(
        "¡Hola! En explorar podés ver libros de los géneros que se ofrecen en este foro",
      );
    });
  }

  const botonesFiltros = document.querySelectorAll(".boton-filtro-genero");

  for (let f = 0; f < botonesFiltros.length; f++) {
    botonesFiltros[f].addEventListener("click", function () {
      // Quitar la clase activa a todos los filtros
      for (let j = 0; j < botonesFiltros.length; j++) {
        botonesFiltros[j].classList.remove("filtro-activo");
      }

      // Activar el filtro presionado
      this.classList.add("filtro-activo");

      // Mostrar solo los libros del género elegido
      const generoElegido = this.dataset.genero;
      const librosExplorar = document.querySelectorAll(".casilla-libro-explorar");

      for (let k = 0; k < librosExplorar.length; k++) {
        if (librosExplorar[k].dataset.genero === generoElegido) {
          librosExplorar[k].style.display = "";
        } else {
          librosExplorar[k].style.display = "none";
        }
      }
    });
  }

  // ==============================================================
  // 4. DETALLE DEL LIBRO, DETALLE DE RESEÑA, HILO Y VOLVER
  // ==============================================================

  function abrirDetalleLibro() {
    mostrarVista("seccion-detalle-libro", "detalle del libro");
    cambiarConsejo("Puedes agregarlo a tu lista de leer más tarde");
  }

  // Click en cualquier portada
  const todasLasPortadas = document.querySelectorAll(".portada-clickeable");

  for (let p = 0; p < todasLasPortadas.length; p++) {
    todasLasPortadas[p].addEventListener("click", abrirDetalleLibro);
  }

  // Click en "ver más" de la miniatura del libro (en mis reseñas)
  const botonesIrDetalleLibro = document.querySelectorAll(
    ".boton-ir-detalle-libro",
  );

  for (let d = 0; d < botonesIrDetalleLibro.length; d++) {
    botonesIrDetalleLibro[d].addEventListener("click", abrirDetalleLibro);
  }

  // Botones "reseñar" de la biblioteca
  const botonesResenar = document.querySelectorAll(".boton-resenar");

  for (let r = 0; r < botonesResenar.length; r++) {
    botonesResenar[r].addEventListener("click", function () {
      mostrarVista("seccion-detalle-resena", "tu reseña");
    });
  }

  // "ver más" en los comentarios laterales de las reseñas
  const botonesVerMasComentario = document.querySelectorAll(
    ".enlace-ver-mas-comentario",
  );

  for (let vm = 0; vm < botonesVerMasComentario.length; vm++) {
    botonesVerMasComentario[vm].addEventListener("click", function () {
      mostrarVista("seccion-hilo-comentarios", "comentarios");
    });
  }

  // Volver a la biblioteca desde el detalle de la reseña
  const botonVolverABiblioteca = document.getElementById(
    "boton-volver-desde-resena",
  );

  if (botonVolverABiblioteca) {
    botonVolverABiblioteca.addEventListener("click", function () {
      mostrarVista("seccion-biblioteca", "mi biblioteca");
    });
  }

  // Volver a reseñas desde el hilo de comentarios
  const botonVolverAResenas = document.getElementById(
    "boton-volver-mis-resenas",
  );

  if (botonVolverAResenas) {
    botonVolverAResenas.addEventListener("click", function () {
      mostrarVista("seccion-resenas", "mis reseñas");
    });
  }

  // ==============================================================
  // 5. MODAL AGREGAR LIBRO POR ISBN (CON MENSAJE DE ERROR)
  // ==============================================================

  const modalAgregar = document.getElementById("modal-agregar-libro");
  const botonAbrirAgregar = document.getElementById("boton-agregar-nuevo-libro");
  const botonCancelarIsbn = document.getElementById("boton-cancelar-isbn");
  const formularioIsbn = document.getElementById("formulario-modal-isbn");
  const campoIsbn = document.getElementById("campo-numero-isbn");
  const textoErrorIsbn = document.getElementById("error-isbn");

  // Abrir ventana flotante
  if (botonAbrirAgregar) {
    botonAbrirAgregar.addEventListener("click", function () {
      modalAgregar.classList.add("modal-activo");
      textoErrorIsbn.classList.remove("activo");
      campoIsbn.value = "";
    });
  }

  // Cancelar y cerrar
  if (botonCancelarIsbn) {
    botonCancelarIsbn.addEventListener("click", function () {
      modalAgregar.classList.remove("modal-activo");
      textoErrorIsbn.classList.remove("activo");
    });
  }

  // Confirmar y validar (se escucha el "submit" del formulario,
  // así funciona tanto con el botón como con la tecla Enter)
  if (formularioIsbn) {
    formularioIsbn.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const valorIngresado = campoIsbn.value.trim();

      if (
        valorIngresado === "" ||
        isNaN(valorIngresado) ||
        valorIngresado.length < 9
      ) {
        textoErrorIsbn.classList.add("activo");
      } else {
        textoErrorIsbn.classList.remove("activo");
        alert("¡Libro con ISBN " + valorIngresado + " agregado con éxito!");
        modalAgregar.classList.remove("modal-activo");
      }
    });
  }

  // ==============================================================
  // 6. ELIMINACIÓN (LIBRO, RESEÑA, COMENTARIO)
  // ==============================================================

  // Guarda la tarjeta que el usuario quiere borrar hasta que confirme
  let tarjetaQueSeVaAEliminar = null;

  const modalEliminarLibro = document.getElementById("modal-eliminar-libro");
  const modalEliminarResena = document.getElementById("modal-eliminar-resena");
  const modalEliminarComentario = document.getElementById(
    "modal-eliminar-comentario",
  );

  // Función reutilizable: confirmar y cancelar de cualquier modal de borrado
  function configurarModalEliminar(modal, idConfirmar, idCancelar) {
    const botonConfirmar = document.getElementById(idConfirmar);
    const botonCancelar = document.getElementById(idCancelar);

    if (botonConfirmar) {
      botonConfirmar.addEventListener("click", function () {
        if (tarjetaQueSeVaAEliminar !== null) {
          tarjetaQueSeVaAEliminar.remove();
          tarjetaQueSeVaAEliminar = null;
        }
        modal.classList.remove("modal-activo");
      });
    }

    if (botonCancelar) {
      botonCancelar.addEventListener("click", function () {
        tarjetaQueSeVaAEliminar = null;
        modal.classList.remove("modal-activo");
      });
    }
  }

  configurarModalEliminar(
    modalEliminarLibro,
    "boton-confirmar-eliminar-libro",
    "boton-cancelar-eliminar-libro",
  );
  configurarModalEliminar(
    modalEliminarResena,
    "boton-confirmar-eliminar-resena",
    "boton-cancelar-eliminar-resena",
  );
  configurarModalEliminar(
    modalEliminarComentario,
    "boton-confirmar-eliminar-comentario",
    "boton-cancelar-eliminar-comentario",
  );

  // Botones "eliminar" de libros (explorar y leer más tarde)
  const botonesEliminarLibro = document.querySelectorAll(
    ".boton-eliminar-libro-explorar, .boton-eliminar-guardado",
  );

  for (let el = 0; el < botonesEliminarLibro.length; el++) {
    botonesEliminarLibro[el].addEventListener("click", function () {
      tarjetaQueSeVaAEliminar = this.parentElement;
      modalEliminarLibro.classList.add("modal-activo");
    });
  }

  // ==============================================================
  // 7. EDITAR Y ELIMINAR (COMENTARIOS Y RESEÑAS)
  // ==============================================================
  // Una sola función sirve para las dos secciones. En vez de borrar los
  // botones con innerHTML (que les hace perder los listeners), los
  // ocultamos mientras se edita y los volvemos a mostrar después.

  function configurarEditarYEliminar(datos) {
    const tarjetas = document.querySelectorAll(datos.selectorTarjeta);

    for (let i = 0; i < tarjetas.length; i++) {
      const tarjeta = tarjetas[i];
      const contenedorBotones = tarjeta.querySelector(datos.selectorBotones);
      const botones = contenedorBotones.querySelectorAll("button");
      const botonEditar = botones[0];
      const botonEliminar = botones[1];
      const textoOriginal = tarjeta.querySelector(datos.selectorTexto);

      // ELIMINAR
      botonEliminar.addEventListener("click", function () {
        tarjetaQueSeVaAEliminar = tarjeta;
        datos.modal.classList.add("modal-activo");
      });

      // EDITAR
      botonEditar.addEventListener("click", function () {
        // Crear el textarea con el texto actual
        const cajaDeTexto = document.createElement("textarea");
        cajaDeTexto.className = datos.claseCampo;
        cajaDeTexto.value = textoOriginal.textContent;

        textoOriginal.style.display = "none";
        textoOriginal.after(cajaDeTexto);

        // Ocultar editar/eliminar y mostrar un botón "confirmar"
        botonEditar.style.display = "none";
        botonEliminar.style.display = "none";

        const botonConfirmar = document.createElement("button");
        botonConfirmar.type = "button";
        botonConfirmar.className = "boton-retro-3d boton-mini";
        botonConfirmar.textContent = "confirmar";
        contenedorBotones.appendChild(botonConfirmar);

        botonConfirmar.addEventListener("click", function () {
          // Guardar lo escrito
          textoOriginal.textContent = cajaDeTexto.value;

          // Limpiar lo temporal
          cajaDeTexto.remove();
          botonConfirmar.remove();

          // Volver a mostrar lo original (los listeners siguen funcionando)
          textoOriginal.style.display = "block";
          botonEditar.style.display = "";
          botonEliminar.style.display = "";
        });
      });
    }
  }

  // Comentarios en "mis comentarios"
  configurarEditarYEliminar({
    selectorTarjeta: ".tarjeta-comentario-grilla",
    selectorBotones: ".acciones-comentario-grilla",
    selectorTexto: ".parrafo-comentario",
    claseCampo: "campo-editar-comentario",
    modal: modalEliminarComentario,
  });

  // Reseñas en "mis reseñas"
  configurarEditarYEliminar({
    selectorTarjeta: ".tarjeta-fila-resena",
    selectorBotones: ".botones-fila-resena",
    selectorTexto: ".extracto-resena",
    claseCampo: "campo-editar-resena",
    modal: modalEliminarResena,
  });

  // ==============================================================
  // 8. CERRAR SESIÓN
  // ==============================================================

  const botonCerrarSesion = document.getElementById("boton-cerrar-sesion");

  if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }
});