import {
  listarComentariosDeResena,
  listarMisComentarios,
  crearComentario,
  borrarComentario
} from "../services/comentarios.service.js"

// GET /api/comentarios
export async function listarMios(req, res) {
  try {
    res.json(await listarMisComentarios(req.usuario.id))
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// GET /api/comentarios/resena/:idResena
export async function deResena(req, res) {
  try {
    res.json(await listarComentariosDeResena(req.params.idResena))
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// POST /api/comentarios
export async function crear(req, res) {
  try {
    const nuevo = await crearComentario(req.body, req.usuario.id)
    res.status(201).json(nuevo)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// DELETE /api/comentarios/:id
export async function borrar(req, res) {
  try {
    await borrarComentario(req.params.id, req.usuario.id)
    res.json({ mensaje: "comentario " + req.params.id + " borrado" })
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}