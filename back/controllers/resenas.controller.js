// EL MOZO DE LAS RESEÑAS: saca de req lo que hace falta, pide y responde
import {
  listarMisResenas,
  listarRecientes,
  listarDeLibro,
  crearResena,
  editarResena,
  borrarResena
} from "../services/resenas.service.js"

// GET /api/resenas
export async function listar(req, res) {
  try {
    res.json(await listarMisResenas(req.usuario.id))
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// GET /api/resenas/recientes
export async function recientes(req, res) {
  try {
    res.json(await listarRecientes())
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// GET /api/resenas/libro/:idItem
export async function deLibro(req, res) {
  try {
    res.json(await listarDeLibro(req.params.idItem))
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// POST /api/resenas
export async function crear(req, res) {
  try {
    const nueva = await crearResena(req.body, req.usuario.id)
    res.status(201).json(nueva)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// PUT /api/resenas/:id
export async function editar(req, res) {
  try {
    const actualizada = await editarResena(req.params.id, req.body, req.usuario.id)
    res.json(actualizada)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// DELETE /api/resenas/:id
export async function borrar(req, res) {
  try {
    await borrarResena(req.params.id, req.usuario.id)
    res.json({ mensaje: "reseña " + req.params.id + " borrada" })
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}