import mongoose from "mongoose"

export const GENEROS = ["suspenso", "terror", "thriller"]
export const ESTADOS = ["leyendo", "leido", "leer-mas-tarde"]

const itemSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  genero: { type: String, enum: GENEROS, default: "suspenso" },
  estado: { type: String, enum: ESTADOS, default: "leer-mas-tarde" },
  portada: {type: String},
  fechaDeCreacion: { type: Date, default: Date.now }
})

export const Item = mongoose.model("Item", itemSchema)

// ESTO ES BASICAMENTE EL MOLDE DE UN LIBRO