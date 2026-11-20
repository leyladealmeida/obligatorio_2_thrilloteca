import mongoose from "mongoose"

// ESTE ES EL MOLDE DE UNA RESEÑA: un texto y una calificación que un usuario le deja a un libro
const resenaSchema = new mongoose.Schema({
  texto: { type: String, required: true, maxlength: 1000 },
  calificacion: { type: Number, required: true, min: 1, max: 5 },
  fechaDeCreacion: { type: Date, default: Date.now },
  // quién la escribió (igual que en Item, clase 11)
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  // sobre qué libro
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true }
})

export const Resena = mongoose.model("Resena", resenaSchema)