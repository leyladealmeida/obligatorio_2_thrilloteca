// ----- referencias al HTML -----
const formulario = document.querySelector("#formulario-autenticacion")
const inpCorreo = document.querySelector("#entrada-correo")
const inpClave = document.querySelector("#entrada-clave")
const errorCorreo = document.querySelector("#error-correo")
const errorClave = document.querySelector("#error-clave")
const errorGlobal = document.querySelector("#error-global")
const botonPrincipal = document.querySelector("#boton-accion-principal")
const botonAlternar = document.querySelector("#boton-alternar-modo")
const tituloFormulario = document.querySelector("#titulo-formulario")
const textoPregunta = document.querySelector("#texto-pregunta")

// El estado de la pantalla: false = ingresando, true = creando cuenta
let modoRegistro = false

// ----- mensajes de error -----
function mostrarError(span, texto) {
  span.textContent = texto
  span.classList.add("activo")
}

function limpiarErrores() {
  const errores = [errorCorreo, errorClave, errorGlobal]
  errores.forEach((span) => {
    span.textContent = ""
    span.classList.remove("activo")
  })
}

// ----- alternar entre login y registro -----
function actualizarTextos() {
  if (modoRegistro) {
    tituloFormulario.textContent = "CREA TU CUENTA"
    botonPrincipal.textContent = "registrarme"
    textoPregunta.textContent = "¿ya tienes cuenta?"
    botonAlternar.textContent = "ingresar"
    inpClave.autocomplete = "new-password"
  } else {
    tituloFormulario.textContent = "ACCEDE A TU CUENTA"
    botonPrincipal.textContent = "ingresar"
    textoPregunta.textContent = "¿no tienes cuenta?"
    botonAlternar.textContent = "crear cuenta"
    inpClave.autocomplete = "current-password"
  }
}

botonAlternar.addEventListener("click", () => {
  modoRegistro = !modoRegistro
  limpiarErrores()
  actualizarTextos()
})

// ----- validar ANTES de molestar al servidor -----
// (el back vuelve a validar: son dos controles distintos, como en la clase 7)
function validarCampos(correo, clave) {
  let valido = true

  if (correo === "") {
    mostrarError(errorCorreo, "escribe tu mail")
    valido = false
  } else if (modoRegistro && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    mostrarError(errorCorreo, "el mail tiene que ser válido")
    valido = false
  }

  if (clave === "") {
    mostrarError(errorClave, "escribe tu contraseña")
    valido = false
  } else if (modoRegistro && clave.length < 8) {
    mostrarError(errorClave, "la contraseña tiene que tener al menos 8 caracteres")
    valido = false
  }

  return valido
}

// ----- el pedido al servidor -----
async function enviarJSON(ruta, datos) {
  let respuesta
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    })
  } catch (error) {
    // fetch solo falla si no llegó al servidor (apagado, URL mal escrita)
    throw new Error("no se pudo conectar con el servidor")
  }

  // Leemos el JSON antes de mirar ok: el back siempre manda { mensaje } en los errores
  const resultado = await respuesta.json()
  if (!respuesta.ok) {
    throw new Error(resultado.mensaje)
  }
  return resultado
}

// ----- el botón principal (se escucha el "submit": sirve con el clic y con Enter) -----
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault()
  limpiarErrores()

  const correo = inpCorreo.value.trim()
  const clave = inpClave.value

  if (!validarCampos(correo, clave)) {
    return
  }

  botonPrincipal.disabled = true
  botonPrincipal.textContent = "cargando..."

  try {
    // El registro del back NO devuelve token: registramos y después hacemos login
    if (modoRegistro) {
      await enviarJSON("/api/register", { email: correo, password: clave })
    }

    const resultado = await enviarJSON("/api/login", { email: correo, password: clave })

    // localStorage (y no una variable) porque al pasar a foro.html la variable se perdería
    localStorage.setItem("token", resultado.token)
    localStorage.setItem("usuario", JSON.stringify(resultado.usuario))

    window.location.href = "foro.html"
  } catch (error) {
    mostrarError(errorGlobal, error.message)
  } finally {
    botonPrincipal.disabled = false
    actualizarTextos()
  }
})