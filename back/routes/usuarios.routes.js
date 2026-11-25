import express from "express"
import { registro, login, actualizarAvatar } from "../controllers/usuarios.controller.js"
import { pedirToken } from "../middlewares/autorizacion.middleware.js"

const router = express.Router()

router.post("/register", registro)                       // POST /api/register
router.post("/login", login)                             // POST /api/login
router.put("/usuarios/avatar", pedirToken, actualizarAvatar) // PUT /api/usuarios/avatar

export default router