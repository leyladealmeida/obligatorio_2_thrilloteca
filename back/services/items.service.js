import {
  buscarTodos,
  buscarTodosPorUsuario,
  buscarPorId,
  guardar,
  eliminar,
  actualizar
} from "../repositories/items.repository.js"
import { ESTADOS, GENEROS } from "../models/item.js"
import { eliminarPorItem } from "../repositories/resenas.repository.js"

const TEMAS_GOOGLE = {
  terror: "horror",
  thriller: "thriller",
  suspenso: "suspense"
}

function errorCon(status, mensaje) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

// Respaldo: si el usuario no elige género, lo deducimos de las categorías de Google Books
function deducirGenero(categorias) {
  const texto = (Array.isArray(categorias) ? categorias.join(" ") : "").toLowerCase()
  if (/horror|terror|ghost|supernatural|gothic|occult/.test(texto)) return "terror"
  if (/thriller|crime|espionage|legal|techno/.test(texto)) return "thriller"
  return "suspenso"
}

// Último recurso para la descripción: Open Library (si Google no la tiene)
async function descripcionDeOpenLibrary(isbn) {
  try {
    const r1 = await fetch(`https://openlibrary.org/isbn/${isbn}.json`)
    if (!r1.ok) return ""
    const edicion = await r1.json()
    let desc = edicion.description

    // a veces la descripción está en la "obra" y no en la edición
    if (!desc && edicion.works && edicion.works[0]) {
      const r2 = await fetch(`https://openlibrary.org${edicion.works[0].key}.json`)
      if (r2.ok) {
        const obra = await r2.json()
        desc = obra.description
      }
    }

    if (!desc) return ""
    // Open Library la manda como texto o como { value: "..." }
    return typeof desc === "string" ? desc : (desc.value || "")
  } catch (error) {
    return ""
  }
}

function validarIsbn(isbn) {
  const limpio = String(isbn || "").replace(/[-\s]/g, "").trim()
  if (!/^[0-9]{9,12}[0-9Xx]$/.test(limpio)) {
    throw errorCon(400, "el ISBN debe tener 10 o 13 números (puede terminar en X)")
  }
  return limpio
}

async function obtenerInfoDeGoogle(isbn) {
  const isbnValido = validarIsbn(isbn)
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbnValido}&key=${apiKey}`

  const respuesta = await fetch(url)
  if (!respuesta.ok) {
    throw errorCon(502, "error al consultar Google Books (código " + respuesta.status + ")")
  }

  const datos = await respuesta.json()

  if (!datos.items || datos.items.length === 0) {
    throw errorCon(404, "no se encontró ningún libro con ese ISBN")
  }

  const volumen = datos.items[0]
  const info = volumen.volumeInfo
  if (!Array.isArray(info.authors) || info.authors.length === 0) {
    throw errorCon(400, "no se pudo identificar el autor del libro")
  }

  let descripcion = info.description || volumen.searchInfo?.textSnippet || ""
  if (!descripcion && volumen.selfLink) {
    const respDetalle = await fetch(`${volumen.selfLink}?key=${apiKey}`)
    if (respDetalle.ok) {
      const detalle = await respDetalle.json()
      descripcion = detalle.volumeInfo?.description || ""
    }
  }
  // Si Google no tiene descripción, probamos con Open Library
  if (!descripcion) {
    descripcion = await descripcionDeOpenLibrary(isbnValido)
  }
  descripcion = descripcion.replace(/<[^>]*>/g, "")

  const portadaUrl = info.imageLinks?.thumbnail
    ? info.imageLinks.thumbnail.replace("http://", "https://")
    : `https://covers.openlibrary.org/b/isbn/${isbnValido}-M.jpg?default=false`

  return {
    isbn: isbnValido,
    titulo: info.title,
    autor: info.authors.join(", "),
    portada: portadaUrl,
    descripcion: descripcion,
    genero: deducirGenero(info.categories)
  }
}

function validar(datos) {
  const titulo = datos.titulo ? String(datos.titulo).trim() : ""
  const autor = datos.autor ? String(datos.autor).trim() : ""
  const genero = datos.genero ? String(datos.genero).trim().toLowerCase() : ""
  const estado = datos.estado ? String(datos.estado).trim() : "leer-mas-tarde"

  if (!titulo || !autor) {
    throw errorCon(400, "faltan datos: título y autor")
  }

  if (!GENEROS.includes(genero)) {
    throw errorCon(400, "el género tiene que ser uno de estos: " + GENEROS.join(", "))
  }

  if (!ESTADOS.includes(estado)) {
    throw errorCon(400, "el estado tiene que ser uno de estos: " + ESTADOS.join(", "))
  }

  return {
    titulo: titulo,
    autor: autor,
    portada: datos.portada || "",
    descripcion: datos.descripcion || "",
    genero: genero,
    estado: estado
  }
}

// 1. LISTAR: solo los libros del usuario
export async function listarItems(idUsuario) {
  return await buscarTodosPorUsuario(idUsuario)
}

// 2. CREAR: trae datos de Google por ISBN y guarda con el género elegido por la usuaria
export async function crearItem(datos, idUsuario) {
  let datosFinales = { ...datos }

  if (datos.isbn) {
    const infoGoogle = await obtenerInfoDeGoogle(datos.isbn)

    const itemsExistentes = await buscarTodosPorUsuario(idUsuario)
    const duplicado = itemsExistentes.find(
      (item) => item.titulo.toLowerCase().trim() === infoGoogle.titulo.toLowerCase().trim()
    )

    if (duplicado) {
      throw errorCon(409, "¡Este libro ya está en tu biblioteca!")
    }

    //AGREGUE GENEROOOO
    datosFinales = {
      titulo: infoGoogle.titulo,
      autor: infoGoogle.autor,
      portada: infoGoogle.portada,
      descripcion: infoGoogle.descripcion,
      // si eligió un género lo respetamos; si no, usamos el deducido de Google Books
      genero: GENEROS.includes(String(datos.genero || "").trim().toLowerCase())
        ? String(datos.genero).trim().toLowerCase()
        : infoGoogle.genero,
      estado: datos.estado || "leer-mas-tarde"
    }
  }

  const limpios = validar(datosFinales)

  // Si no vino por ISBN (ej: se agregó desde las sugerencias de Explorar) también evitamos repetidos
  if (!datos.isbn) {
    const mios = await buscarTodosPorUsuario(idUsuario)
    const repetido = mios.find(
      (item) => item.titulo.toLowerCase().trim() === limpios.titulo.toLowerCase().trim()
    )
    if (repetido) {
      throw errorCon(409, "¡Este libro ya está en tu biblioteca!")
    }
  }

  limpios.usuario = idUsuario

  return await guardar(limpios)
}

// 3. BORRAR: verifica dueño (403) y borra reseñas en cascada
export async function borrarItem(id, idUsuario) {
  const item = await buscarPorId(id)

  if (!item) {
    throw errorCon(404, "no existe un libro con id " + id)
  }

  if (item.usuario.toString() !== idUsuario) {
    throw errorCon(403, "no tenés permiso para eliminar este libro")
  }

  await eliminarPorItem(id)
  return await eliminar(id)
}

// 4. ACTUALIZAR (PUT): permite cambiar estado y/o género del libro
export async function cambiarEstado(id, datos, idUsuario) {
  const cambios = {}

  if (datos.estado !== undefined) {
    const estado = String(datos.estado).trim()
    if (!ESTADOS.includes(estado)) {
      throw errorCon(400, "el estado tiene que ser uno de estos: " + ESTADOS.join(", "))
    }
    cambios.estado = estado
  }

  if (datos.genero !== undefined) {
    const genero = String(datos.genero).trim().toLowerCase()
    if (!GENEROS.includes(genero)) {
      throw errorCon(400, "el género tiene que ser uno de estos: " + GENEROS.join(", "))
    }
    cambios.genero = genero
  }

  if (Object.keys(cambios).length === 0) {
    throw errorCon(400, "tenés que enviar estado o género para actualizar")
  }

  const item = await buscarPorId(id)
  if (!item) {
    throw errorCon(404, "no existe un libro con id " + id)
  }
  if (item.usuario.toString() !== idUsuario) {
    throw errorCon(403, "no tenés permiso para modificar este libro")
  }

  return await actualizar(id, cambios)
}

// 5. BUSCAR EN GOOGLE BOOKS POR GÉNERO (para Explorar)
export async function buscarLibrosEnGoogle(genero) {
  const generoLimpio = String(genero || "suspenso").trim().toLowerCase()
  if (!GENEROS.includes(generoLimpio)) {
    throw errorCon(400, "el género tiene que ser uno de estos: " + GENEROS.join(", "))
  }

  const tema = TEMAS_GOOGLE[generoLimpio]
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${tema}&maxResults=12&key=${apiKey}`

  const respuesta = await fetch(url)
  if (!respuesta.ok) {
    throw errorCon(502, "error al buscar libros en Google Books")
  }

  const datos = await respuesta.json()
  if (!datos.items) {
    return []
  }

  return datos.items.map((vol) => {
    const info = vol.volumeInfo || {}
    const ids = info.industryIdentifiers || []
    const isbnObj = ids.find((i) => i.type === "ISBN_13") || ids.find((i) => i.type === "ISBN_10")
    const portada = info.imageLinks?.thumbnail
      ? info.imageLinks.thumbnail.replace("http://", "https://")
      : ""

    return {
      titulo: info.title || "Sin título",
      autor: Array.isArray(info.authors) ? info.authors.join(", ") : "Autor desconocido",
      portada: portada,
      descripcion: (info.description || vol.searchInfo?.textSnippet || "").replace(/<[^>]*>/g, ""),
      genero: generoLimpio,
      isbn: isbnObj ? isbnObj.identifier : ""
    }
  })
}

// 6. EXPLORAR (comunidad): libros que guardaron los usuarios de Thrilloteca, sin repetidos, los más guardados primero
export async function explorarItems(idUsuario) {
  const todos = await buscarTodos()
  const grupos = new Map()

  for (const item of todos) {
    // libros viejos guardados sin dueño (antes de existir el campo usuario): se ignoran
    if (!item.usuario || !item.titulo) {
      continue
    }

    const clave = item.titulo.toLowerCase().trim()
    const esMio = item.usuario.toString() === idUsuario
    const actual = grupos.get(clave)

    if (!actual) {
      grupos.set(clave, { ...item, guardadoPor: 1, yaLoTenes: esMio })
    } else {
      // si el libro también es mío, uso MI copia (así el detalle me deja cambiar el estado)
      const base = esMio && !actual.yaLoTenes ? item : actual
      grupos.set(clave, {
        ...base,
        guardadoPor: actual.guardadoPor + 1,
        yaLoTenes: actual.yaLoTenes || esMio
      })
    }
  }

  return Array.from(grupos.values()).sort((a, b) => b.guardadoPor - a.guardadoPor)
}

// 7. COPIAR: agrega a MI biblioteca un libro que vi en Explorar (comunidad)
export async function copiarItem(id, idUsuario) {
  const original = await buscarPorId(id)
  if (!original) {
    throw errorCon(404, "no existe un libro con id " + id)
  }

  const mios = await buscarTodosPorUsuario(idUsuario)
  const yaLoTengo = mios.find(
    (i) => i.titulo.toLowerCase().trim() === original.titulo.toLowerCase().trim()
  )
  if (yaLoTengo) {
    throw errorCon(409, "¡Este libro ya está en tu biblioteca!")
  }

  return await guardar({
    titulo: original.titulo,
    autor: original.autor,
    genero: original.genero,
    portada: original.portada,
    descripcion: original.descripcion,
    estado: "leer-mas-tarde",
    usuario: idUsuario
  })
}