// ESTE SERIA EL MOZO EN EL EJEMPLO DEL PROFE

import {
  listarItems,
  crearItem,
  borrarItem,
  cambiarEstado,
  buscarLibrosEnGoogle,
  explorarItems,
  copiarItem
} from "../services/items.service.js"

// GET /api/items
export async function listar(req, res) {
  try {
    const lista = await listarItems(req.usuario.id)
    res.json(lista)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// POST /api/items
export async function crear(req, res) {
  try {
    const nuevo = await crearItem(req.body, req.usuario.id)
    res.status(201).json(nuevo)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// DELETE /api/items/:id
export async function borrar(req, res) {
  try {
    const id = req.params.id
    await borrarItem(id, req.usuario.id)
    res.json({ mensaje: "libro " + id + " borrado" })
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// PUT /api/items/:id
export async function editar(req, res) {
  try {
    const id = req.params.id
    const actualizado = await cambiarEstado(id, req.body, req.usuario.id)
    res.json(actualizado)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// GET /api/libros/buscar?genero=terror
export async function buscarExternos(req, res) {
  try {
    const lista = await buscarLibrosEnGoogle(req.query.genero)
    res.json(lista)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// GET /api/items/explorar   (libros guardados por la comunidad)
export async function explorar(req, res) {
  try {
    res.json(await explorarItems(req.usuario.id))
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// POST /api/items/copiar/:id
export async function copiar(req, res) {
  try {
    const nuevo = await copiarItem(req.params.id, req.usuario.id)
    res.status(201).json(nuevo)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}