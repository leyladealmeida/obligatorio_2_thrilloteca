import { Usuario } from "../models/usuario.js"

export async function buscarPorEmail(email) {
  return await Usuario.findOne({ email: email })
}

export async function guardar(datos) {
  const nuevo = new Usuario(datos)
  return await nuevo.save()
}

export async function actualizarAvatar(idUsuario, avatar) {
  return await Usuario.findByIdAndUpdate(
    idUsuario,
    { avatar: avatar },
    { new: true, runValidators: true }
  )
}