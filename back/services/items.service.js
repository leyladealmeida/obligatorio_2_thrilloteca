// ACA VAN LAS REGLAS (SERIA EL COCINERO EN EL EJEMPLO DEL PROFE)

import { buscarTodos, guardar, eliminar } from "../repositories/items.repository.js"

const AUTORES_PERMITIDOS = [
  "Stephen King",
  "Joe Hill",
  "Dan Simmons",
  "Clive Barker",
  "Peter Straub",
  "Robert McCammon",
  "Paul Tremblay"
]

function errorCon(status, mensaje) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

async function obtenerInfoDeGoogle(isbn) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`
  
  const respuesta = await fetch(url)
  const datos = await respuesta.json()

  if (!datos.items || datos.items.length === 0) {
    throw errorCon(404, "no se encontró ningún libro con ese ISBN")
  }

  const info = datos.items[0].volumeInfo
  if (!Array.isArray(info.authors) || info.authors.length === 0) {
    throw errorCon(400, "no se pudo identificar el autor del libro")
  }

  let portadaUrl = info.imageLinks?.thumbnail 
    ? info.imageLinks.thumbnail.replace("http://", "https://")
    : `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`

  return {
    isbn: isbn,
    titulo: info.title,
    autor: info.authors.join(", "),
    portada: portadaUrl,
    descripcion: info.description || ""
  }
}

function validar(datos) {
  const titulo = datos.titulo ? String(datos.titulo).trim() : ""
  const autor = datos.autor ? String(datos.autor).trim() : ""

  if (!titulo || !autor) {
    throw errorCon(400, "faltan datos: título y autor")
  }

  const autores = autor.split(",").map(nombre => nombre.trim().toLowerCase())
  const autoresPermitidos = AUTORES_PERMITIDOS.map(nombre => nombre.toLowerCase())
  if (!autores.some(nombre => autoresPermitidos.includes(nombre))) {
    throw errorCon(400, "solo se permiten libros de autores permitidos")
  }

  return { 
    titulo: titulo, 
    autor: autor,
    portada: datos.portada || "",
    estado: datos.estado || "leer-mas-tarde"
  }
}

export async function listarItems() {
  return await buscarTodos()
}

export async function crearItem(datos) {
  let datosFinales = datos

  if (datos.isbn) {
    const infoGoogle = await obtenerInfoDeGoogle(datos.isbn)

    // Validar duplicados por título
    const itemsExistentes = await buscarTodos()
    const duplicado = itemsExistentes.find(item => 
      item.titulo.toLowerCase().trim() === infoGoogle.titulo.toLowerCase().trim()
    )

    if (duplicado) {
      throw errorCon(409, "¡Este libro ya está en tu biblioteca de Leer más tarde!")
    }

    datosFinales = {
      titulo: infoGoogle.titulo,
      autor: infoGoogle.autor,
      portada: infoGoogle.portada,
      estado: datos.estado || "leer-mas-tarde"
    }
  }

  const limpios = validar(datosFinales)
  return await guardar(limpios)
}

export async function borrarItem(id) {
  const borrado = await eliminar(id)
  if (!borrado) {
    throw errorCon(404, "no existe un libro con id " + id)
  }
  return borrado
}