import mongoose from "mongoose"
import { Comentario } from "../models/comentario.js"

// Todos los comentarios hechos en una reseña (para mostrarlos en el hilo)
export async function buscarPorResena(idResena) {
  if (!mongoose.isValidObjectId(idResena)) {
    return []
  }
  return await Comentario.find({ resena: idResena })
    .populate("usuario", "email")
    .sort({ fechaDeCreacion: 1 })
}

// Los comentarios que escribió el usuario logueado (para la pestaña "mis comentarios")
export async function buscarPorUsuario(idUsuario) {
  if (!mongoose.isValidObjectId(idUsuario)) {
    return []
  }
  return await Comentario.find({ usuario: idUsuario })
    .populate({
      path: "resena",
      populate: [
        { path: "usuario", select: "email" },
        { path: "item", select: "titulo portada" }
      ]
    })
    .sort({ fechaDeCreacion: -1 })
}

export async function buscarPorId(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }
  return await Comentario.findById(id)
}

export async function guardar(datos) {
  const nuevo = new Comentario(datos)
  return await nuevo.save()
}

export async function eliminar(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }
  return await Comentario.findByIdAndDelete(id)
}

// Borrado en cascada: si se borra una reseña, se borran sus comentarios
export async function eliminarPorResena(idResena) {
  if (!mongoose.isValidObjectId(idResena)) {
    return
  }
  await Comentario.deleteMany({ resena: idResena })
}