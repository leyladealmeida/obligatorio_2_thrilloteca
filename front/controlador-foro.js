// Cuando se publique en Render, cambiar esta línea (igual que en script-autenticacion.js)
const BASE_URL = "http://localhost:3000";

// El token que dejó el login. Sin token no hay nada que hacer acá
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "index.html";
}

function cerrarSesionLocal() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
}

// Todos los pedidos al back pasan por acá: agrega el token y atiende el 401
async function pedirAlBack(ruta, opciones) {
  const config = opciones || {};
  const headers = { "Authorization": "Bearer " + token };

  if (config.body) {
    headers["Content-Type"] = "application/json";
  }

  let respuesta;
  try {
    respuesta = await fetch(BASE_URL + ruta, {
      method: config.method || "GET",
      headers: headers,
      body: config.body
    });
  } catch (error) {
    throw new Error("no se pudo conectar con el servidor");
  }

  // 401 = token vencido o inválido: volvemos al login
  if (respuesta.status === 401) {
    cerrarSesionLocal();
    throw new Error("tu sesión venció, volvé a ingresar");
  }

  return respuesta;
}

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

      // Los libros vienen de la base: volvemos a pintar con el género elegido
      generoActual = this.dataset.genero;
      textoBusqueda = "";
      if (campoBusqueda) {
        campoBusqueda.value = "";
      }
      pintarExplorar();
    });
  }

  // ==============================================================
  // 4. DETALLE DEL LIBRO, DETALLE DE RESEÑA, HILO Y VOLVER
  // ==============================================================

  function abrirDetalleLibro(item) {
    libroAbierto = item || null;

    const imgDetalle = document.querySelector("#seccion-detalle-libro .imagen-portada-rotada");
    const barra = document.getElementById("barra-info-libro");
    const mensajeDetalle = document.getElementById("detalle-mensaje");
    mensajeDetalle.textContent = "";

    if (item) {
      // Si el libro no tiene portada, ocultamos la imagen (así no queda la de otro libro)
      if (imgDetalle) {
        imgDetalle.onerror = function () { this.style.visibility = "hidden"; };
        if (item.portada) {
          imgDetalle.style.visibility = "visible";
          imgDetalle.src = item.portada;
        } else {
          imgDetalle.style.visibility = "hidden";
        }
      }

      document.getElementById("detalle-titulo").textContent = item.titulo;
      document.getElementById("detalle-autor").textContent = "autor: " + item.autor;
      document.getElementById("detalle-genero").textContent = "género: " + (item.genero || "suspenso");
      document.getElementById("detalle-descripcion").textContent = item.descripcion || "este libro no tiene descripción guardada";
      document.getElementById("detalle-estado").value = item.estado;
      barra.style.display = "flex";
    } else {
      // Se llegó desde una tarjeta de ejemplo (sin datos de la base)
      if (imgDetalle) {
        imgDetalle.style.visibility = "visible";
      }
      barra.style.display = "none";
    }

      cargarResenasDeLibro(item ? item._id : null); 

    mostrarVista("seccion-detalle-libro", "detalle del libro");
    cambiarConsejo("Puedes cambiar el estado de tu libro desde acá");
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
        const respuesta = await pedirAlBack("/api/items", {
          method: "POST",
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

        await recargarTodo();
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
  let idLibroAEliminar = null;
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

  /* configurarModalEliminar(
    modalEliminarLibro,
    "boton-confirmar-eliminar-libro",
    "boton-cancelar-eliminar-libro"
  ); 
  !!!!esto lo cambio por esto nuevo!!!!!*/
  const botonConfirmarEliminarLibro = document.getElementById("boton-confirmar-eliminar-libro");
  const botonCancelarEliminarLibro = document.getElementById("boton-cancelar-eliminar-libro");

  if (botonConfirmarEliminarLibro) {
    botonConfirmarEliminarLibro.addEventListener("click", async function () {
      if (idLibroAEliminar !== null) {
        try {
          const respuesta = await pedirAlBack("/api/items/" + idLibroAEliminar, {
            method: "DELETE"
          });
          const datos = await respuesta.json();

          if (!respuesta.ok) {
            throw new Error(datos.mensaje || "no se pudo eliminar el libro");
          }
        } catch (error) {
          alert("Error al eliminar: " + error.message);
          idLibroAEliminar = null;
          tarjetaQueSeVaAEliminar = null;
          modalEliminarLibro.classList.remove("modal-activo");
          return;
        }
      }

      tarjetaQueSeVaAEliminar = null;
      idLibroAEliminar = null;
      modalEliminarLibro.classList.remove("modal-activo");

      // Volvemos a pedir la lista: así se actualizan todas las pantallas a la vez
      await recargarTodo();
    });
  }

  if (botonCancelarEliminarLibro) {
    botonCancelarEliminarLibro.addEventListener("click", function () {
      tarjetaQueSeVaAEliminar = null;
      idLibroAEliminar = null;
      modalEliminarLibro.classList.remove("modal-activo");
    });
  }

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
    botonCerrarSesion.addEventListener("click", cerrarSesionLocal);
  }

  // ==============================================================
  // 9. CONEXIÓN CON EL BACK (AJAX)
  // ==============================================================
  // Una sola lista (todosLosItems) alimenta todas las pantallas:
  // se pide una vez al back y cada función "pintar" muestra su parte.

  let todosLosItems = [];
  let libroAbierto = null;
  let generoActual = "suspenso";
  let textoBusqueda = "";

  const contenedorLibrosGuardados = document.getElementById("contenedor-libros-guardados");
  const contenedorProgreso = document.getElementById("contenedor-libros-progreso");
  const estanteriaLeidos = document.getElementById("estanteria-leidos");
  const textoEstanteFecha = document.getElementById("texto-estante-fecha");
  const contenedorExplorar = document.getElementById("contenedor-libros-explorar");
  const formularioBusqueda = document.getElementById("formulario-busqueda");
  const campoBusqueda = document.getElementById("campo-busqueda");
  const nombreUsuario = document.getElementById("nombre-usuario");
  const biografiaUsuario = document.getElementById("biografia-usuario");
  const selectEstado = document.getElementById("detalle-estado");
  const botonGuardarEstado = document.getElementById("boton-guardar-estado");
  const mensajeDetalle = document.getElementById("detalle-mensaje");

  // ----- pedidos al back -----

  async function obtenerItems() {
    const respuesta = await pedirAlBack("/api/items");
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje);
    }
    return datos;
  }

  // PUT /api/items/:id  (solo cambia el estado: leyendo, leido o leer-mas-tarde)
  async function cambiarEstadoEnBack(id, estado) {
    const respuesta = await pedirAlBack("/api/items/" + id, {
      method: "PUT",
      body: JSON.stringify({ estado: estado })
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje);
    }
    return datos;
  }

  // ----- ayudas para dibujar -----

  function mostrarMensajeEn(contenedor, mensaje) {
    const texto = document.createElement("p");
    texto.className = "mensaje-libros-guardados";
    texto.textContent = mensaje;
    contenedor.replaceChildren(texto);
  }

  // Casilla con portada, título, autor y botón eliminar (la usan "leer más tarde" y "explorar")
  function crearCasilla(item, claseCasilla, claseBotonEliminar) {
    const casilla = document.createElement("div");
    casilla.className = claseCasilla;

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

    portada.addEventListener("click", function () {
      abrirDetalleLibro(item);
    });

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
    botonEliminar.className = "boton-retro-3d boton-mini " + claseBotonEliminar;
    botonEliminar.textContent = "eliminar";
    botonEliminar.addEventListener("click", function () {
      tarjetaQueSeVaAEliminar = casilla;
      idLibroAEliminar = item._id;
      modalEliminarLibro.classList.add("modal-activo");
    });

    casilla.append(portada, datosLibro, botonEliminar);
    return casilla;
  }

  // ----- LEER MÁS TARDE -----

  function pintarLeerMasTarde() {
    const guardados = todosLosItems.filter(function (item) {
      return item.estado === "leer-mas-tarde";
    });

    if (guardados.length === 0) {
      mostrarMensajeEn(contenedorLibrosGuardados, "todavía no guardaste ningún libro");
      return;
    }

    contenedorLibrosGuardados.replaceChildren();
    guardados.forEach(function (item) {
      contenedorLibrosGuardados.appendChild(
        crearCasilla(item, "casilla-libro-guardado", "boton-eliminar-guardado")
      );
    });
  }

  // ----- EXPLORAR (filtro por género y buscador) -----

  function marcarFiltroActivo(genero) {
    for (let i = 0; i < botonesFiltros.length; i++) {
      if (botonesFiltros[i].dataset.genero === genero) {
        botonesFiltros[i].classList.add("filtro-activo");
      } else {
        botonesFiltros[i].classList.remove("filtro-activo");
      }
    }
  }

  function pintarExplorar() {
    const termino = textoBusqueda.toLowerCase();

    // Si hay búsqueda se busca en todos los géneros; si no, se filtra por el género elegido
    marcarFiltroActivo(termino ? null : generoActual);

    const resultados = todosLosItems.filter(function (item) {
      if (termino) {
        return (item.titulo + " " + item.autor).toLowerCase().includes(termino);
      }
      return item.genero === generoActual;
    });

    if (resultados.length === 0) {
      mostrarMensajeEn(
        contenedorExplorar,
        termino ? "no hay libros que coincidan con \"" + textoBusqueda + "\"" : "no tenés libros de este género"
      );
      return;
    }

    contenedorExplorar.replaceChildren();
    resultados.forEach(function (item) {
      contenedorExplorar.appendChild(
        crearCasilla(item, "casilla-libro-explorar", "boton-eliminar-libro-explorar")
      );
    });
  }

  if (formularioBusqueda) {
    formularioBusqueda.addEventListener("submit", function (evento) {
      evento.preventDefault();
      textoBusqueda = campoBusqueda.value.trim();
      pintarExplorar();
      mostrarVista("seccion-explorar", "explorar");
    });
  }

  // ----- MI BIBLIOTECA -----

  const COLORES_LOMO = ["lomo-resplandor", "lomo-it", "lomo-misery", "lomo-psicosis"];

  function crearTarjetaProgreso(item, indice) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-libro-progreso";

    const lomo = document.createElement("div");
    lomo.className = "lomo-libro " + COLORES_LOMO[indice % COLORES_LOMO.length];

    const diamante = document.createElement("span");
    diamante.className = "icono-diamante";
    diamante.textContent = "◈";

    const textoLomo = document.createElement("span");
    textoLomo.className = "texto-lomo";
    textoLomo.textContent = item.titulo.length > 16 ? item.titulo.slice(0, 15) + "…" : item.titulo;

    lomo.append(diamante, textoLomo);
    lomo.addEventListener("click", function () {
      abrirDetalleLibro(item);
    });

    const detalles = document.createElement("div");
    detalles.className = "detalles-libro-progreso";

    const titulo = document.createElement("p");
    titulo.className = "titulo-libro-tarjeta";
    titulo.textContent = item.titulo;

    const autor = document.createElement("p");
    autor.className = "subtexto-tarjeta";
    autor.textContent = item.autor;

    const estado = document.createElement("p");
    estado.className = "porcentaje-lectura";
    estado.textContent = "leyendo";

    const botones = document.createElement("div");
    botones.className = "botones-progreso";

    const botonResenar = document.createElement("button");
    botonResenar.type = "button";
    botonResenar.className = "boton-retro-3d boton-mini boton-resenar";
    botonResenar.textContent = "reseñar";
    botonResenar.addEventListener("click", function () {
      abrirModalResena(item);
    });

    const botonTermine = document.createElement("button");
    botonTermine.type = "button";
    botonTermine.className = "boton-retro-3d boton-mini";
    botonTermine.textContent = "terminé";
    botonTermine.addEventListener("click", async function () {
      try {
        await cambiarEstadoEnBack(item._id, "leido");
        await recargarTodo();
      } catch (error) {
        alert("No se pudo cambiar el estado: " + error.message);
      }
    });

    botones.append(botonResenar, botonTermine);
    detalles.append(titulo, autor, estado, botones);
    tarjeta.append(lomo, detalles);
    return tarjeta;
  }

  function pintarBiblioteca() {
    // Libros en progreso
    const leyendo = todosLosItems.filter(function (item) {
      return item.estado === "leyendo";
    });

    if (leyendo.length === 0) {
      mostrarMensajeEn(contenedorProgreso, "no estás leyendo ningún libro: pasá uno desde su detalle");
    } else {
      contenedorProgreso.replaceChildren();
      leyendo.forEach(function (item, indice) {
        contenedorProgreso.appendChild(crearTarjetaProgreso(item, indice));
      });
    }

    // Últimos leídos (los 5 más recientes), como lomos en la estantería
    const leidos = todosLosItems.filter(function (item) {
      return item.estado === "leido";
    });
    const ultimos = leidos.slice(-5);

    estanteriaLeidos.replaceChildren();
    ultimos.forEach(function (item, indice) {
      const lomo = document.createElement("div");
      lomo.className = "lomo-grafico barra-" + ((indice % 5) + 1);
      lomo.title = item.titulo + " - " + item.autor;
      lomo.style.cursor = "pointer";
      lomo.addEventListener("click", function () {
        abrirDetalleLibro(item);
      });
      estanteriaLeidos.appendChild(lomo);
    });

    textoEstanteFecha.textContent = leidos.length === 0
      ? "todavía no terminaste ningún libro"
      : "libros leídos: " + leidos.length;
  }

  // ----- PERFIL (sale del usuario que dejó el login) -----

  function pintarPerfil() {
    let usuario = null;
    try {
      usuario = JSON.parse(localStorage.getItem("usuario"));
    } catch (error) {
      usuario = null;
    }

    if (usuario && usuario.email) {
      nombreUsuario.textContent = usuario.email.split("@")[0];
    }

    const leyendo = todosLosItems.filter(function (item) {
      return item.estado === "leyendo";
    }).length;

    biografiaUsuario.textContent =
      todosLosItems.length + " libros en tu biblioteca, " + leyendo + " leyendo ahora.";
  }

  // ----- CAMBIAR EL ESTADO DESDE EL DETALLE DEL LIBRO -----

  if (botonGuardarEstado) {
    botonGuardarEstado.addEventListener("click", async function () {
      if (libroAbierto === null) {
        return;
      }

      try {
        await cambiarEstadoEnBack(libroAbierto._id, selectEstado.value);
        const idActual = libroAbierto._id;
        await recargarTodo();
        libroAbierto = todosLosItems.find(function (item) {
          return item._id === idActual;
        }) || libroAbierto;
        mensajeDetalle.textContent = "estado actualizado";
      } catch (error) {
        mensajeDetalle.textContent = error.message;
      }
    });
  }

  // ==============================================================
  // 10. RESEÑAS REALES CON EL BACK (/api/resenas)
  // ==============================================================

  let libroParaResenar = null;
  let todasLasResenas = [];

  const modalAgregarResena = document.getElementById("modal-agregar-resena");
  const tituloModalResena = document.getElementById("titulo-modal-resena");
  const formResena = document.getElementById("formulario-modal-resena");
  const selectCalificacion = document.getElementById("select-calificacion-resena");
  const campoTextoResena = document.getElementById("campo-texto-resena");
  const errorResena = document.getElementById("error-resena");
  const botonCancelarResena = document.getElementById("boton-cancelar-resena");
  const botonAgregarResenaDetalle = document.getElementById("boton-agregar-resena-libro");
  const contenedorMisResenas = document.getElementById("contenedor-mis-resenas");
  const contenedorFeed = document.querySelector(".lista-tarjetas-feed");

  function abrirModalResena(item) {
    if (!item || !item._id) {
      alert("Abrí primero un libro de tu biblioteca para reseñarlo.");
      return;
    }
    libroParaResenar = item;
    tituloModalResena.textContent = "reseñar: " + item.titulo;
    campoTextoResena.value = "";
    selectCalificacion.value = "5";
    errorResena.classList.remove("activo");
    modalAgregarResena.classList.add("modal-activo");
  }

  if (botonCancelarResena) {
    botonCancelarResena.addEventListener("click", function () {
      libroParaResenar = null;
      modalAgregarResena.classList.remove("modal-activo");
    });
  }

  // Botón "agregar reseña" dentro de Detalle del Libro
  if (botonAgregarResenaDetalle) {
    botonAgregarResenaDetalle.addEventListener("click", function () {
      abrirModalResena(libroAbierto);
    });
  }

  // Enviar nueva reseña al back (POST /api/resenas)
  if (formResena) {
    formResena.addEventListener("submit", async function (evento) {
      evento.preventDefault();
      errorResena.classList.remove("activo");

      const texto = campoTextoResena.value.trim();
      const calificacion = Number(selectCalificacion.value);

      if (!texto) {
        errorResena.textContent = "escribí tu reseña antes de publicar";
        errorResena.classList.add("activo");
        return;
      }

      try {
        const respuesta = await pedirAlBack("/api/resenas", {
          method: "POST",
          body: JSON.stringify({
            itemId: libroParaResenar._id,
            texto: texto,
            calificacion: calificacion
          })
        });

        const datos = await respuesta.json();
        if (!respuesta.ok) {
          throw new Error(datos.mensaje || "no se pudo guardar la reseña");
        }

        alert("¡Reseña publicada!");
        modalAgregarResena.classList.remove("modal-activo");
        await cargarResenasDeLibro(libroParaResenar._id);
        libroParaResenar = null;
        await cargarResenas();
        mostrarVista("seccion-resenas", "mis reseñas");
      } catch (error) {
        errorResena.textContent = error.message;
        errorResena.classList.add("activo");
      }
    });
  }

  // Dibujar "Mis reseñas" y el "Feed de inicio"
  function pintarMisResenas(lista) {
    if (!contenedorMisResenas) return;

    if (lista.length === 0) {
      mostrarMensajeEn(contenedorMisResenas, "todavía no escribiste ninguna reseña");
      return;
    }

    contenedorMisResenas.replaceChildren();
    lista.forEach(function (resena) {
      const fila = document.createElement("article");
      fila.className = "tarjeta-fila-resena";

      const datosDiv = document.createElement("div");
      datosDiv.className = "datos-fila-resena";

      const encabezado = document.createElement("h5");
      encabezado.className = "encabezado-fila-resena";
      const estrellas = "★".repeat(resena.calificacion) + "☆".repeat(5 - resena.calificacion);
      encabezado.textContent = resena.item.titulo + " - " + estrellas;

      const extracto = document.createElement("p");
      extracto.className = "extracto-resena";
      extracto.textContent = resena.texto;

      const botones = document.createElement("div");
      botones.className = "botones-fila-resena";

      const btnEliminar = document.createElement("button");
      btnEliminar.type = "button";
      btnEliminar.className = "boton-retro-3d boton-mini boton-eliminar";
      btnEliminar.textContent = "eliminar";
      btnEliminar.addEventListener("click", async function () {
        if (!confirm("¿Eliminar esta reseña?")) return;
        try {
          const resp = await pedirAlBack("/api/resenas/" + resena._id, { method: "DELETE" });
          if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.mensaje);
          }
          await cargarResenas();
        } catch (error) {
          alert("Error al eliminar reseña: " + error.message);
        }
      });

      botones.appendChild(btnEliminar);
      datosDiv.append(encabezado, extracto, botones);
      fila.appendChild(datosDiv);
      contenedorMisResenas.appendChild(fila);
    });
  }

  let resenaActivaParaComentar = null;
  const contenedorDestacado = document.getElementById("contenedor-destacado");

  function pintarFeedInicio(recientes) {
    if (!contenedorFeed) return;
    if (recientes.length === 0) {
      mostrarMensajeEn(contenedorFeed, "todavía no hay publicaciones de tus amigos");
      if (contenedorDestacado) mostrarMensajeEn(contenedorDestacado, "no hay libros destacados todavía");
      return;
    }

    // Llenamos Libro Destacado con el primer libro reseñado
    const destacada = recientes[0];
    if (contenedorDestacado && destacada.item) {
      contenedorDestacado.replaceChildren();
      if (destacada.item.portada) {
        const img = document.createElement("img");
        img.src = destacada.item.portada;
        img.alt = destacada.item.titulo;
        img.style.width = "100px";
        img.style.height = "140px";
        img.style.objectFit = "cover";
        img.style.border = "2px solid #000";
        contenedorDestacado.appendChild(img);
      }
      const tit = document.createElement("p");
      tit.className = "titulo-destacado";
      tit.textContent = destacada.item.titulo;

      const aut = document.createElement("p");
      aut.className = "autor-destacado";
      aut.textContent = destacada.item.autor || "";

      const btnVer = document.createElement("button");
      btnVer.type = "button";
      btnVer.className = "boton-retro-3d boton-mini";
      btnVer.textContent = "ver reseñas y comentar";
      btnVer.addEventListener("click", function () {
        abrirLibroDesdeFeed(destacada);
      });

      contenedorDestacado.append(tit, aut, btnVer);
    }

    // Pintamos el Feed del inicio Amigos para que sean clickeable
    contenedorFeed.replaceChildren();
    recientes.forEach(function (resena) {
      const art = document.createElement("article");
      art.className = "tarjeta-publicacion-retro";
      art.style.cursor = "pointer";

      const enc = document.createElement("p");
      enc.className = "encabezado-publicacion";
      const nombre = resena.usuario && resena.usuario.email ? resena.usuario.email.split("@")[0] : "usuario";
      enc.textContent = nombre + " reseñó " + resena.item.titulo + " (" + "★".repeat(resena.calificacion) + "):";

      const cuerpo = document.createElement("p");
      cuerpo.className = "cuerpo-publicacion";
      cuerpo.textContent = "\"" + resena.texto + "\"";

      const pista = document.createElement("small");
      pista.textContent = "click para ver y comentar →";
      pista.style.color = "#3A0F96";

      art.addEventListener("click", function () {
        abrirLibroDesdeFeed(resena);
      });

      art.append(enc, cuerpo, pista);
      contenedorFeed.appendChild(art);
    });
  }

  function abrirLibroDesdeFeed(resena) {
    resenaActivaParaComentar = resena;
    const itemDeResena = resena.item;
    // Si el libro es mío lo busco en todosLosItems; si es de otro usuario uso los datos que vinieron en la reseña
    const itemLocal = todosLosItems.find(function (i) { return i._id === itemDeResena._id; });
    abrirDetalleLibro(itemLocal || itemDeResena);
    // Si el libro es de otro usuario, ocultamos el selector de estado (no es nuestro)
    if (!itemLocal) {
      const barra = document.getElementById("barra-info-libro");
      if (barra) barra.style.display = "none";
    }
    cargarComentariosDeResena(resena._id);
  }

  async function cargarResenas() {
    try {
      const [respMias, respRecientes] = await Promise.all([
        pedirAlBack("/api/resenas"),
        pedirAlBack("/api/resenas/recientes")
      ]);
      if (respMias.ok) {
        todasLasResenas = await respMias.json();
        pintarMisResenas(todasLasResenas);
      }
      if (respRecientes.ok) {
        const recientes = await respRecientes.json();
        pintarFeedInicio(recientes);
      }
    } catch (error) {
      console.error("Error cargando reseñas:", error);
    }
  }

  cargarResenas();

  const contenedorResenasLibro = document.querySelector("#seccion-detalle-libro .cuerpo-libreta-scroll");

  async function cargarResenasDeLibro(idItem) {
    if (!contenedorResenasLibro) return;
    if (!idItem) {
      mostrarMensajeEn(contenedorResenasLibro, "todavía no hay reseñas de este libro");
      return;
    }

    try {
      const resp = await pedirAlBack("/api/resenas/libro/" + idItem);
      const lista = await resp.json();

      if (!resp.ok || lista.length === 0) {
        mostrarMensajeEn(contenedorResenasLibro, "todavía no hay reseñas de este libro");
        return;
      }

      contenedorResenasLibro.replaceChildren();
      lista.forEach(function (resena) {
        const fila = document.createElement("div");
        fila.className = "fila-resena-comunidad";

        const texto = document.createElement("p");
        texto.className = "texto-resena-comunidad";
        const autor = resena.usuario && resena.usuario.email ? resena.usuario.email.split("@")[0] : "usuario";
        const estrellas = "★".repeat(resena.calificacion);
        texto.textContent = autor + " (" + estrellas + "): " + resena.texto;

        fila.append (texto);
        contenedorResenasLibro.appendChild(fila);
      });
    } catch (error) {
      mostrarMensajeEn(contenedorResenasLibro, "no se pudieron cargar las reseñas");
    }
  }

  // ==============================================================
  // 11. COMENTARIOS REALES CON EL BACK (/api/comentarios)
  // ==============================================================

  const modalAgregarComentario = document.getElementById("modal-agregar-comentario");
  const formComentario = document.getElementById("formulario-modal-comentario");
  const campoTextoComentario = document.getElementById("campo-texto-comentario");
  const errorComentario = document.getElementById("error-comentario");
  const botonCancelarComentario = document.getElementById("boton-cancelar-comentario");
  const botonAgregarComentarioDetalle = document.getElementById("boton-agregar-comentario-libro");
  const listaComentariosDetalle = document.querySelector("#seccion-detalle-libro .lista-comentarios-desplazable");
  const contenedorMisComentarios = document.getElementById("contenedor-mis-comentarios");

  if (botonAgregarComentarioDetalle) {
    botonAgregarComentarioDetalle.addEventListener("click", function () {
      if (!resenaActivaParaComentar) {
        alert("Este libro todavía no tiene una reseña seleccionada para comentar.");
        return;
      }
      campoTextoComentario.value = "";
      errorComentario.classList.remove("activo");
      modalAgregarComentario.classList.add("modal-activo");
    });
  }

  if (botonCancelarComentario) {
    botonCancelarComentario.addEventListener("click", function () {
      modalAgregarComentario.classList.remove("modal-activo");
    });
  }

  if (formComentario) {
    formComentario.addEventListener("submit", async function (evento) {
      evento.preventDefault();
      errorComentario.classList.remove("activo");

      const texto = campoTextoComentario.value.trim();
      if (!texto) {
        errorComentario.textContent = "escribí tu comentario antes de publicar";
        errorComentario.classList.add("activo");
        return;
      }

      try {
        const resp = await pedirAlBack("/api/comentarios", {
          method: "POST",
          body: JSON.stringify({
            resenaId: resenaActivaParaComentar._id,
            texto: texto
          })
        });
        const datos = await resp.json();
        if (!resp.ok) {
          throw new Error(datos.mensaje || "no se pudo guardar el comentario");
        }

        modalAgregarComentario.classList.remove("modal-activo");
        await cargarComentariosDeResena(resenaActivaParaComentar._id);
        await cargarMisComentarios();
      } catch (error) {
        errorComentario.textContent = error.message;
        errorComentario.classList.add("activo");
      }
    });
  }

  async function cargarComentariosDeResena(idResena) {
    if (!listaComentariosDetalle) return;
    if (!idResena) {
      mostrarMensajeEn(listaComentariosDetalle, "todavía no hay comentarios");
      return;
    }

    try {
      const resp = await pedirAlBack("/api/comentarios/resena/" + idResena);
      const lista = await resp.json();

      if (!resp.ok || lista.length === 0) {
        mostrarMensajeEn(listaComentariosDetalle, "todavía no hay comentarios");
        return;
      }

      listaComentariosDetalle.replaceChildren();
      lista.forEach(function (com) {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-comentario-negra";

        const info = document.createElement("div");
        info.className = "info-comentario-negro";

        const p = document.createElement("p");
        p.className = "texto-comentario-negro";
        const autor = com.usuario && com.usuario.email ? com.usuario.email.split("@")[0] : "usuario";
        p.textContent = autor + ": " + com.texto;

        info.appendChild(p);
        tarjeta.appendChild(info);
        listaComentariosDetalle.appendChild(tarjeta);
      });
    } catch (error) {
      mostrarMensajeEn(listaComentariosDetalle, "error al cargar comentarios");
    }
  }

  async function cargarMisComentarios() {
    if (!contenedorMisComentarios) return;
    try {
      const resp = await pedirAlBack("/api/comentarios");
      const lista = await resp.json();

      if (!resp.ok || lista.length === 0) {
        mostrarMensajeEn(contenedorMisComentarios, "todavía no hiciste ningún comentario");
        return;
      }

      contenedorMisComentarios.replaceChildren();
      lista.forEach(function (com) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-comentario-grilla";

        const cuerpo = document.createElement("div");
        cuerpo.className = "cuerpo-comentario-grilla";

        const h5 = document.createElement("h5");
        h5.className = "titulo-origen-comentario";
        h5.textContent = "EN RESEÑA DE: " + com.resena.item.titulo;

        const p = document.createElement("p");
        p.className = "parrafo-comentario";
        p.textContent = com.texto;

        const acciones = document.createElement("div");
        acciones.className = "acciones-comentario-grilla";

        const btnBorrar = document.createElement("button");
        btnBorrar.type = "button";
        btnBorrar.className = "boton-retro-3d boton-mini boton-eliminar";
        btnBorrar.textContent = "eliminar";
        btnBorrar.addEventListener("click", async function () {
          if (!confirm("¿Eliminar este comentario?")) return;
          const r = await pedirAlBack("/api/comentarios/" + com._id, { method: "DELETE" });
          if (r.ok) {
            await cargarMisComentarios();
            if (resenaActivaParaComentar) await cargarComentariosDeResena(resenaActivaParaComentar._id);
          }
        });

        acciones.appendChild(btnBorrar);
        cuerpo.append(h5, p, acciones);
        tarjeta.appendChild(cuerpo);
        contenedorMisComentarios.appendChild(tarjeta);
      });
    } catch (error) {
      console.error("Error cargando mis comentarios:", error);
    }
  }

  cargarMisComentarios();

  // ----- PEDIR LA LISTA Y PINTAR TODAS LAS PANTALLAS -----

  async function recargarTodo() {
    try {
      todosLosItems = await obtenerItems();
      pintarLeerMasTarde();
      pintarBiblioteca();
      pintarExplorar();
      pintarPerfil();
      cargarResenas();
    } catch (error) {
      console.error("No se pudieron cargar los libros:", error);
      const aviso = "no se pudieron cargar los libros: " + error.message;
      mostrarMensajeEn(contenedorLibrosGuardados, aviso);
      mostrarMensajeEn(contenedorProgreso, aviso);
      mostrarMensajeEn(contenedorExplorar, aviso);
    }
  }

  recargarTodo();
});