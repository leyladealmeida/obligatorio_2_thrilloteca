import mongoose from "mongoose"

export const AVATARES = [
  "img/avatar1.png",
  "img/avatar2.png",
  "img/avatar3.png",
  "img/avatar4.png",
  "img/avatar5.png"
]

const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  // Acá NO va la contraseña: va el HASH
  password: { type: String, required: true },
  avatar: { type: String, enum: AVATARES, default: "img/avatar1.png" },
  fechaDeCreacion: { type: Date, default: Date.now }
})

export const Usuario = mongoose.model("Usuario", usuarioSchema)