import express from "express"
import { listar, crear, editar, borrar, explorar, copiar } from "../controllers/items.controller.js"

const router = express.Router()

// Las rutas fijas van ANTES que las que llevan :id
// (la búsqueda en Google Books, GET /api/libros/buscar, está registrada en index.js)
router.get("/", listar)                    // GET /api/items
router.get("/explorar", explorar)          // GET /api/items/explorar               (comunidad)
router.post("/", crear)                    // POST /api/items
router.post("/copiar/:id", copiar)         // POST /api/items/copiar/:id
router.delete("/:id", borrar)              // DELETE /api/items/:id
router.put("/:id", editar)                 // PUT /api/items/:id

export default router