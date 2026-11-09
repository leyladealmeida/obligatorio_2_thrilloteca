import express from "express"
import { registro, login } from "../controllers/usuarios.controller.js"

const router = express.Router()

router.post("/register", registro) // POST /api/register
router.post("/login", login)       // POST /api/login

export default router