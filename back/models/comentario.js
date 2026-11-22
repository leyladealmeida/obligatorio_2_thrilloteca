import mongoose from "mongoose"

const comentarioSchema = new mongoose.Schema({
  texto: { type: String, required: true, maxlength: 500 },
  fechaDeCreacion: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  resena: { type: mongoose.Schema.Types.ObjectId, ref: "Resena", required: true }
})

export const Comentario = mongoose.model("Comentario", comentarioSchema)