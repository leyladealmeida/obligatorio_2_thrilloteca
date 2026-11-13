// ACA VAN LAS REGLAS (SERIA EL COCINERO EN EL EJEMPLO DEL PROFE)

import {
  buscarTodosPorUsuario,
  buscarPorId,
  guardar,
  eliminar,
  actualizar
} from "../repositories/items.repository.js"
import { ESTADOS } from "../models/item.js"

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

// 1. LISTAR: solo los libros asociados al usuario por id
export async function listarItems(idUsuario) {
  return await buscarTodosPorUsuario(idUsuario)
}

// 2. CREAR: asigna el ID del usuario al libro y busca duplicados solo dentro de su lista
export async function crearItem(datos, idUsuario) {
  let datosFinales = datos

  if (datos.isbn) {
    const infoGoogle = await obtenerInfoDeGoogle(datos.isbn)

    // Validar duplicados únicamente entre los libros del usuario logueado
    const itemsExistentes = await buscarTodosPorUsuario(idUsuario)
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
  limpios.usuario = idUsuario // Se vincula la propiedad usuario

  return await guardar(limpios)
}

// 3. BORRAR: revisa si el libro existe y si pertenece al idUsuario antes de eliminar (403 si es ajeno)
export async function borrarItem(id, idUsuario) {
  const item = await buscarPorId(id)

  if (!item) {
    throw errorCon(404, "no existe un libro con id " + id)
  }

  // Verificación de pertenencia
  if (item.usuario.toString() !== idUsuario) {
    throw errorCon(403, "no tenés permiso para eliminar este libro")
  }

  return await eliminar(id)
}

// 4. CAMBIAR ESTADO: valida el estado, y revisa que el libro exista y sea del usuario
export async function cambiarEstado(id, datos, idUsuario) {
  const estado = datos.estado ? String(datos.estado).trim() : ""

  // Regla que se resuelve MIRANDO los datos
  if (!ESTADOS.includes(estado)) {
    throw errorCon(400, "el estado tiene que ser uno de estos: " + ESTADOS.join(", "))
  }

  // Regla que hay que PREGUNTARLE a la base: ¿existe y es suyo?
  const item = await buscarPorId(id)
  if (!item) {
    throw errorCon(404, "no existe un libro con id " + id)
  }
  if (item.usuario.toString() !== idUsuario) {
    throw errorCon(403, "no tenés permiso para modificar este libro")
  }

  return await actualizar(id, { estado: estado })
}