import express from "express"
import { listar, recientes, deLibro, crear, editar, borrar } from "../controllers/resenas.controller.js"

const router = express.Router()

// Las rutas fijas van ANTES que las que llevan :id (si no, "recientes" se tomaría como un id)
router.get("/", listar)                    // GET /api/resenas
router.get("/recientes", recientes)        // GET /api/resenas/recientes
router.get("/libro/:idItem", deLibro)      // GET /api/resenas/libro/:idItem
router.post("/", crear)                    // POST /api/resenas
router.put("/:id", editar)                 // PUT /api/resenas/:id
router.delete("/:id", borrar)              // DELETE /api/resenas/:id

export default router