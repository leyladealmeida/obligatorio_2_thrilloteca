// EL DEPÓSITO DE LAS RESEÑAS: solo guarda y busca, no opina
import mongoose from "mongoose"
import { Resena } from "../models/resena.js"
import { Item } from "../models/item.js"

// Las reseñas de un usuario, con los datos del libro incluidos (populate)
export async function buscarPorUsuario(idUsuario) {
  if (!mongoose.isValidObjectId(idUsuario)) {
    return []
  }
  return await Resena.find({ usuario: idUsuario })
    .populate("item", "titulo autor portada")
    .sort({ fechaDeCreacion: -1 })
}

// Las últimas reseñas de todos los usuarios (para el feed de inicio)
export async function buscarRecientes(limite) {
  return await Resena.find()
    .populate("usuario", "email")
    .populate("item", "titulo autor portada")
    .sort({ fechaDeCreacion: -1 })
    .limit(limite)
}

// Las reseñas de TODOS los usuarios para un mismo libro (se reconoce por el título)
export async function buscarPorTituloDeLibro(titulo) {
  const libros = await Item.find({ titulo: titulo }).select("_id")
  const ids = libros.map((libro) => libro._id)
  return await Resena.find({ item: { $in: ids } })
    .populate("usuario", "email")
    .sort({ fechaDeCreacion: -1 })
}

// ¿Este usuario ya reseñó este libro? Devuelve la reseña o null
export async function buscarPorUsuarioYLibro(idUsuario, idItem) {
  return await Resena.findOne({ usuario: idUsuario, item: idItem })
}

export async function buscarPorId(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }
  return await Resena.findById(id)
}

export async function guardar(datos) {
  const nueva = new Resena(datos)
  return await nueva.save()
}

// new: true -> devuelve la reseña ya modificada
export async function actualizar(id, datos) {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }
  return await Resena.findByIdAndUpdate(id, datos, { new: true, runValidators: true })
}

export async function eliminar(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }
  return await Resena.findByIdAndDelete(id)
}

// Cuando se borra un libro, se borran también sus reseñas
export async function eliminarPorItem(idItem) {
  if (!mongoose.isValidObjectId(idItem)) {
    return
  }
  await Resena.deleteMany({ item: idItem })
}