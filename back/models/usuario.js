import mongoose from "mongoose"

const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  // Acá NO va la contraseña: va el HASH
  password: { type: String, required: true },
  fechaDeCreacion: { type: Date, default: Date.now }
})

export const Usuario = mongoose.model("Usuario", usuarioSchema)