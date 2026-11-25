import mongoose from "mongoose"
import { Item } from "../models/item.js"

// Busca únicamente los libros pertenecientes al ID del usuario
export async function buscarTodosPorUsuario(idUsuario) {
  if (!mongoose.isValidObjectId(idUsuario)) {
    return []
  }
  return await Item.find({ usuario: idUsuario })
}

// Busca un libro por ID para que el servicio pueda verificar quién es el dueño
export async function buscarPorId(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }
  return await Item.findById(id)
}

// function guardar 
export async function guardar(datos) {
  const nuevo = new Item(datos)
  return await nuevo.save()
}

// function eliminar con la validación de la Clase 9
export async function eliminar(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }
  return await Item.findByIdAndDelete(id)
}

// Devuelve el item YA modificado, o null si no existe
export async function actualizar(id, datos) {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }
  // new: true -> devuelve el documento después del cambio (clase 9)
  // runValidators: true -> en los updates Mongoose NO revisa el enum si no se pide
  return await Item.findByIdAndUpdate(id, datos, { new: true, runValidators: true })
}

// Todos los libros de todos los usuarios (para Explorar)
export async function buscarTodos() {
  return await Item.find().sort({ fechaDeCreacion: -1 }).lean()
}