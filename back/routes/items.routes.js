import express from "express"
import { listar, crear, editar, borrar } from "../controllers/items.controller.js"

const router = express.Router()

router.get("/", listar)         // GET /api/items
router.post("/", crear)         // POST /api/items
router.delete("/:id", borrar)   // DELETE /api/items/:id
router.put("/:id", editar)      // PUT /api/items/:id

export default router