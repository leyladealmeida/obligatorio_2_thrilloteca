import { registrarUsuario, loginUsuario, cambiarAvatarUsuario } from "../services/usuarios.service.js"

// POST /api/register
export async function registro(req, res) {
  try {
    const usuario = await registrarUsuario(req.body)
    res.status(201).json(usuario)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// POST /api/login
export async function login(req, res) {
  try {
    const resultado = await loginUsuario(req.body)
    res.json(resultado)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// PUT /api/usuarios/avatar
export async function actualizarAvatar(req, res) {
  try {
    const usuario = await cambiarAvatarUsuario(req.usuario.id, req.body.avatar)
    res.json(usuario)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}