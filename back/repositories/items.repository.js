// EL DEPOSITO: SOLAMENTE GUARDA Y BUSCA

import mongoose from "mongoose"
import { Item } from "../models/item.js"

export async function buscarTodos() {
  return await Item.find()
}

export async function guardar(datos) {
  const nuevo = new Item(datos)
  return await nuevo.save()
}

// Devuelve el item borrado, o null si no existe
export async function eliminar(id) {
  if (!mongoose.isValidObjectId(id)) { // isValidObjectId - lo dio en la clase 9, el id de Mongo
    return null
  }
  return await Item.findByIdAndDelete(id)
}