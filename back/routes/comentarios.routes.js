import express from "express"
import { listarMios, deResena, crear, borrar } from "../controllers/comentarios.controller.js"

const router = express.Router()

router.get("/", listarMios)                     // GET /api/comentarios
router.get("/resena/:idResena", deResena)       // GET /api/comentarios/resena/:idResena
router.post("/", crear)                         // POST /api/comentarios
router.delete("/:id", borrar)                   // DELETE /api/comentarios/:id

export default router