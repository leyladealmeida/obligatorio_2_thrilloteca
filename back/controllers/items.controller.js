// ESTE SERIA EL MOZO EN EL EJEMPLO DEL PROFE

import { listarItems, crearItem, borrarItem } from "../services/items.service.js"

// GET /api/items
export async function listar(req, res) {
  try {
    const lista = await listarItems()
    res.json(lista)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// POST /api/items
export async function crear(req, res) {
  try {
    const nuevo = await crearItem(req.body)
    res.status(201).json(nuevo)
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}

// DELETE /api/items/:id
export async function borrar(req, res) {
  try {
    const id = req.params.id // este es el id que viene en la URL (clase 6 y 7)
    await borrarItem(id)
    res.json({ mensaje: "libro " + id + " borrado" })
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message })
  }
}