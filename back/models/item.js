import mongoose from "mongoose"

export const GENEROS = ["suspenso", "terror", "thriller"]
export const ESTADOS = ["leyendo", "leido", "leer-mas-tarde"]

const itemSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  genero: { type: String, enum: GENEROS, default: "suspenso" },
  estado: { type: String, enum: ESTADOS, default: "leer-mas-tarde" },
  portada: {type: String},
  descripcion: { type: String, default: "" }, 
  fechaDeCreacion: { type: Date, default: Date.now },
  ///ESTO ES NUEVO - PARA QUE SE GUARDE EL LIBRO AGREGADA AL USUARIO QUE LO AGREGO
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Usuario", 
    required: true
}
})

export const Item = mongoose.model("Item", itemSchema)

// ESTO ES BASICAMENTE EL MOLDE DE UN LIBRO