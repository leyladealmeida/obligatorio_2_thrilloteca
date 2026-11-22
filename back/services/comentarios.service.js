import {
  buscarPorResena,
  buscarPorUsuario,
  buscarPorId,
  guardar,
  eliminar
} from "../repositories/comentarios.repository.js"
import { buscarPorId as buscarResenaPorId } from "../repositories/resenas.repository.js"

function errorCon(status, mensaje) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

function validar(datos) {
  const texto = datos.texto ? String(datos.texto).trim() : ""
  if (!texto) {
    throw errorCon(400, "escribí tu comentario")
  }
  if (texto.length > 500) {
    throw errorCon(400, "el comentario no puede pasar los 500 caracteres")
  }
  return { texto: texto }
}

export async function listarComentariosDeResena(idResena) {
  return await buscarPorResena(idResena)
}

export async function listarMisComentarios(idUsuario) {
  const lista = await buscarPorUsuario(idUsuario)
  // Si la reseña o el libro fueron borrados, no se muestra
  return lista.filter((c) => c.resena && c.resena.item)
}

export async function crearComentario(datos, idUsuario) {
  const limpios = validar(datos)

  const resena = await buscarResenaPorId(datos.resenaId)
  if (!resena) {
    throw errorCon(404, "no existe esa reseña")
  }

  limpios.usuario = idUsuario
  limpios.resena = datos.resenaId
  return await guardar(limpios)
}

export async function borrarComentario(id, idUsuario) {
  const comentario = await buscarPorId(id)
  if (!comentario) {
    throw errorCon(404, "no existe un comentario con id " + id)
  }
  if (comentario.usuario.toString() !== idUsuario) {
    throw errorCon(403, "no tenés permiso para eliminar este comentario")
  }
  return await eliminar(id)
}