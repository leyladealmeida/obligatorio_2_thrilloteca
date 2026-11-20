// ACÁ VAN LAS REGLAS DE LAS RESEÑAS (EL COCINERO)
import {
  buscarPorUsuario,
  buscarRecientes,
  buscarPorTituloDeLibro,
  buscarPorUsuarioYLibro,
  buscarPorId,
  guardar,
  actualizar,
  eliminar
} from "../repositories/resenas.repository.js"
import { buscarPorId as buscarLibroPorId } from "../repositories/items.repository.js"

function errorCon(status, mensaje) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

// Reglas que se resuelven MIRANDO los datos
function validar(datos) {
  const texto = datos.texto ? String(datos.texto).trim() : ""
  const calificacion = Number(datos.calificacion)

  if (!texto) {
    throw errorCon(400, "escribí tu reseña")
  }
  if (texto.length > 1000) {
    throw errorCon(400, "la reseña no puede pasar los 1000 caracteres")
  }
  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    throw errorCon(400, "la calificación tiene que ser un número del 1 al 5")
  }
  return { texto: texto, calificacion: calificacion }
}

// Regla que hay que PREGUNTARLE a la base: ¿existe y es mía?
function chequearQueSeaTuya(resena, idUsuario) {
  if (resena.usuario.toString() !== idUsuario) {
    throw errorCon(403, "esa reseña no es tuya")
  }
}

export async function listarMisResenas(idUsuario) {
  const lista = await buscarPorUsuario(idUsuario)
  // si el libro ya no existe, la reseña no se muestra
  return lista.filter((resena) => resena.item)
}

export async function listarRecientes() {
  const lista = await buscarRecientes(10)
  return lista.filter((resena) => resena.item && resena.usuario)
}

export async function listarDeLibro(idItem) {
  const libro = await buscarLibroPorId(idItem)
  if (!libro) {
    throw errorCon(404, "no existe un libro con id " + idItem)
  }
  return await buscarPorTituloDeLibro(libro.titulo)
}

export async function crearResena(datos, idUsuario) {
  const limpios = validar(datos)                       // 1) mirar

  const libro = await buscarLibroPorId(datos.itemId)   // 2) preguntar
  if (!libro) {
    throw errorCon(404, "no existe un libro con id " + datos.itemId)
  }
  if (libro.usuario.toString() !== idUsuario) {
    throw errorCon(403, "solo podés reseñar libros de tu biblioteca")
  }
  const existente = await buscarPorUsuarioYLibro(idUsuario, datos.itemId)
  if (existente) {
    throw errorCon(409, "ya reseñaste este libro: podés editar tu reseña")
  }

  limpios.usuario = idUsuario                          // 3) guardar
  limpios.item = datos.itemId
  return await guardar(limpios)
}

export async function editarResena(id, datos, idUsuario) {
  const limpios = validar(datos)

  const resena = await buscarPorId(id)
  if (!resena) {
    throw errorCon(404, "no existe una reseña con id " + id)
  }
  chequearQueSeaTuya(resena, idUsuario)

  return await actualizar(id, limpios)
}

export async function borrarResena(id, idUsuario) {
  const resena = await buscarPorId(id)
  if (!resena) {
    throw errorCon(404, "no existe una reseña con id " + id)
  }
  chequearQueSeaTuya(resena, idUsuario)

  return await eliminar(id)
}