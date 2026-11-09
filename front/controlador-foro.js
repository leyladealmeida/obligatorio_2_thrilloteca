// Esperar a que todo el documento HTML esté cargado
document.addEventListener("DOMContentLoaded", function () {
  // ==============================================================
  // 1. VISTAS, PESTAÑAS Y FUNCIÓN PARA CAMBIAR DE PANTALLA
  // ==============================================================

  const todasLasVistas = document.querySelectorAll(".vista-seccion");
  const pestanas = document.querySelectorAll(".pestana-boton");
  const tituloVentana = document.getElementById("titulo-ventana");
  const textoAsistente = document.getElementById("texto-consejo-asistente");

  function mostrarVista(idVista, titulo) {
    for (let i = 0; i < todasLasVistas.length; i++) {
      todasLasVistas[i].classList.remove("vista-activa");
    }

    const vista = document.getElementById(idVista);
    if (vista) {
      vista.classList.add("vista-activa");
    }

    for (let i = 0; i < pestanas.length; i++) {
      if (pestanas[i].dataset.seccion === idVista) {
        pestanas[i].classList.add("pestana-activa");
      } else {
        pestanas[i].classList.remove("pestana-activa");
      }
    }

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
        "¡Hola! En explorar podés ver libros de los géneros que se ofrecen en este foro"
      );
    });
  }

  const botonesFiltros = document.querySelectorAll(".boton-filtro-genero");

  for (let f = 0; f < botonesFiltros.length; f++) {
    botonesFiltros[f].addEventListener("click", function () {
      for (let j = 0; j < botonesFiltros.length; j++) {
        botonesFiltros[j].classList.remove("filtro-activo");
      }

      this.classList.add("filtro-activo");

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

  function abrirDetalleLibro(datosLibro) {
    if (datosLibro && datosLibro.portada) {
      const imgDetalle = document.querySelector("#seccion-detalle-libro .imagen-portada-rotada");
      if (imgDetalle) {
        imgDetalle.src = datosLibro.portada;
      }
    }
    mostrarVista("seccion-detalle-libro", "detalle del libro");
    cambiarConsejo("Puedes agregarlo a tu lista de leer más tarde");
  }

  const todasLasPortadas = document.querySelectorAll(".portada-clickeable");

  for (let p = 0; p < todasLasPortadas.length; p++) {
    todasLasPortadas[p].addEventListener("click", function() {
      abrirDetalleLibro();
    });
  }

  const botonesIrDetalleLibro = document.querySelectorAll(
    ".boton-ir-detalle-libro"
  );

  for (let d = 0; d < botonesIrDetalleLibro.length; d++) {
    botonesIrDetalleLibro[d].addEventListener("click", function() {
      abrirDetalleLibro();
    });
  }

  const botonesResenar = document.querySelectorAll(".boton-resenar");

  for (let r = 0; r < botonesResenar.length; r++) {
    botonesResenar[r].addEventListener("click", function () {
      mostrarVista("seccion-detalle-resena", "tu reseña");
    });
  }

  const botonesVerMasComentario = document.querySelectorAll(
    ".enlace-ver-mas-comentario"
  );

  for (let vm = 0; vm < botonesVerMasComentario.length; vm++) {
    botonesVerMasComentario[vm].addEventListener("click", function () {
      mostrarVista("seccion-hilo-comentarios", "comentarios");
    });
  }

  const botonVolverABiblioteca = document.getElementById(
    "boton-volver-desde-resena"
  );

  if (botonVolverABiblioteca) {
    botonVolverABiblioteca.addEventListener("click", function () {
      mostrarVista("seccion-biblioteca", "mi biblioteca");
    });
  }

  const botonVolverAResenas = document.getElementById(
    "boton-volver-mis-resenas"
  );

  if (botonVolverAResenas) {
    botonVolverAResenas.addEventListener("click", function () {
      mostrarVista("seccion-resenas", "mis reseñas");
    });
  }

  // ==============================================================
  // 5. AGREGAR LIBRO POR ISBN (CON MENSAJE DE ERROR Y AJAX)
  // ==============================================================

  const modalAgregar = document.getElementById("modal-agregar-libro");
  const botonAbrirAgregar = document.getElementById("boton-agregar-nuevo-libro");
  const botonCancelarIsbn = document.getElementById("boton-cancelar-isbn");
  const formularioIsbn = document.getElementById("formulario-modal-isbn");
  const campoIsbn = document.getElementById("campo-numero-isbn");
  const textoErrorIsbn = document.getElementById("error-isbn");

  if (botonAbrirAgregar) {
    botonAbrirAgregar.addEventListener("click", function () {
      modalAgregar.classList.add("modal-activo");
      textoErrorIsbn.classList.remove("activo");
      campoIsbn.value = "";
    });
  }

  if (botonCancelarIsbn) {
    botonCancelarIsbn.addEventListener("click", function () {
      modalAgregar.classList.remove("modal-activo");
      textoErrorIsbn.classList.remove("activo");
    });
  }

  if (formularioIsbn) {
    formularioIsbn.addEventListener("submit", async function (evento) {
      evento.preventDefault();

      const valorIngresado = campoIsbn.value.trim();

      if (valorIngresado === "" || valorIngresado.length < 9) {
        textoErrorIsbn.textContent = "ingresá un número de ISBN válido";
        textoErrorIsbn.classList.add("activo");
        return;
      }

     try {
        const respuesta = await fetch(BASE_URL + "/api/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            isbn: valorIngresado,
            estado: "leer-mas-tarde"
          })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || "error al guardar el libro");
        }

        // Cartel de aviso de éxito 
        alert("¡Libro '" + datos.titulo + "' agregado con éxito a Thrilloteca!");

        textoErrorIsbn.classList.remove("activo");
        modalAgregar.classList.remove("modal-activo");
        campoIsbn.value = "";
        
        await cargarLeerMasTarde();
        mostrarVista("seccion-leer-tarde", titulosPorVista["seccion-leer-tarde"]);

      } catch (error) {
        textoErrorIsbn.textContent = error.message;
        textoErrorIsbn.classList.add("activo");
      }
    });
  }

  // ==============================================================
  // 6. ELIMINACIÓN (LIBRO, RESEÑA, COMENTARIO)
  // ==============================================================

  let tarjetaQueSeVaAEliminar = null;

  const modalEliminarLibro = document.getElementById("modal-eliminar-libro");
  const modalEliminarResena = document.getElementById("modal-eliminar-resena");
  const modalEliminarComentario = document.getElementById(
    "modal-eliminar-comentario"
  );

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
    "boton-cancelar-eliminar-libro"
  );
  configurarModalEliminar(
    modalEliminarResena,
    "boton-confirmar-eliminar-resena",
    "boton-cancelar-eliminar-resena"
  );
  configurarModalEliminar(
    modalEliminarComentario,
    "boton-confirmar-eliminar-comentario",
    "boton-cancelar-eliminar-comentario"
  );

  const botonesEliminarLibro = document.querySelectorAll(
    ".boton-eliminar-libro-explorar, .boton-eliminar-guardado"
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

  function configurarEditarYEliminar(datos) {
    const tarjetas = document.querySelectorAll(datos.selectorTarjeta);

    for (let i = 0; i < tarjetas.length; i++) {
      const tarjeta = tarjetas[i];
      const contenedorBotones = tarjeta.querySelector(datos.selectorBotones);
      const botones = contenedorBotones.querySelectorAll("button");
      const botonEditar = botones[0];
      const botonEliminar = botones[1];
      const textoOriginal = tarjeta.querySelector(datos.selectorTexto);

      botonEliminar.addEventListener("click", function () {
        tarjetaQueSeVaAEliminar = tarjeta;
        datos.modal.classList.add("modal-activo");
      });

      botonEditar.addEventListener("click", function () {
        const cajaDeTexto = document.createElement("textarea");
        cajaDeTexto.className = datos.claseCampo;
        cajaDeTexto.value = textoOriginal.textContent;

        textoOriginal.style.display = "none";
        textoOriginal.after(cajaDeTexto);

        botonEditar.style.display = "none";
        botonEliminar.style.display = "none";

        const botonConfirmar = document.createElement("button");
        botonConfirmar.type = "button";
        botonConfirmar.className = "boton-retro-3d boton-mini";
        botonConfirmar.textContent = "confirmar";
        contenedorBotones.appendChild(botonConfirmar);

        botonConfirmar.addEventListener("click", function () {
          textoOriginal.textContent = cajaDeTexto.value;
          cajaDeTexto.remove();
          botonConfirmar.remove();
          textoOriginal.style.display = "block";
          botonEditar.style.display = "";
          botonEliminar.style.display = "";
        });
      });
    }
  }

  configurarEditarYEliminar({
    selectorTarjeta: ".tarjeta-comentario-grilla",
    selectorBotones: ".acciones-comentario-grilla",
    selectorTexto: ".parrafo-comentario",
    claseCampo: "campo-editar-comentario",
    modal: modalEliminarComentario,
  });

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

  // ==============================================================
  // 9. CONEXIÓN CON EL BACK (AJAX)
  // ==============================================================

  const BASE_URL = "http://localhost:3000";

  async function obtenerItems() {
    const respuesta = await fetch(BASE_URL + "/api/items");
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje);
    }
    return datos;
  }

  const contenedorLibrosGuardados = document.getElementById(
    "contenedor-libros-guardados"
  );

  function mostrarMensajeLeerMasTarde(mensaje) {
    const texto = document.createElement("p");
    texto.className = "mensaje-libros-guardados";
    texto.textContent = mensaje;
    contenedorLibrosGuardados.replaceChildren(texto);
  }

  function pintarLeerMasTarde(items) {
    contenedorLibrosGuardados.innerHTML = "";

    if (items.length === 0) {
      mostrarMensajeLeerMasTarde("todavía no guardaste ningún libro");
      return;
    }

    items.forEach(function (item) {
      const casilla = document.createElement("div");
      casilla.className = "casilla-libro-guardado";

      const portada = document.createElement("div");
      portada.className = "caja-portada-blanca portada-clickeable";

      if (item.portada) {
        const img = document.createElement("img");
        img.src = item.portada;
        img.alt = item.titulo;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        portada.appendChild(img);
      } else {
        portada.textContent = "sin portada";
      }

      const datosLibro = document.createElement("div");
      datosLibro.className = "datos-libro-guardado";

      const titulo = document.createElement("p");
      titulo.className = "titulo-portada-item";
      titulo.textContent = item.titulo;

      const autor = document.createElement("p");
      autor.className = "autor-portada-item";
      autor.textContent = item.autor;

      datosLibro.append(titulo, autor);

      const botonEliminar = document.createElement("button");
      botonEliminar.type = "button";
      botonEliminar.className = "boton-retro-3d boton-mini boton-eliminar-guardado";
      botonEliminar.textContent = "eliminar";
      botonEliminar.addEventListener("click", function() {
        tarjetaQueSeVaAEliminar = casilla;
        modalEliminarLibro.classList.add("modal-activo");
      });

      portada.addEventListener("click", function() {
        abrirDetalleLibro(item);
      });

      casilla.appendChild(portada);
      casilla.appendChild(datosLibro);
      casilla.appendChild(botonEliminar);
      contenedorLibrosGuardados.appendChild(casilla);
    });
  }

  async function cargarLeerMasTarde() {
    try {
      const items = await obtenerItems();
      const guardados = items.filter(function (item) {
        return item.estado === "leer-mas-tarde";
      });
      pintarLeerMasTarde(guardados);
    } catch (error) {
      console.error("No se pudieron cargar los libros guardados:", error);
      mostrarMensajeLeerMasTarde(
        "no se pudieron cargar los libros: " + error.message
      );
    }
  }

  cargarLeerMasTarde();
});