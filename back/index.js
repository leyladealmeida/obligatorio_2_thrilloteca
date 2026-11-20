import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import { conectarBase } from "./config/db.js"
import usuariosRouter from "./routes/usuarios.routes.js"
import itemsRouter from "./routes/items.routes.js"
import resenasRouter from "./routes/resenas.routes.js"
import { pedirToken } from "./middlewares/autorizacion.middleware.js"

await conectarBase()

const app = express()

app.use(cors())
app.use(express.json())

// El "anotador": muestra en la terminal cada pedido que llega
app.use((req, res, next) => {
  console.log(req.method + " " + req.url)
  next()
})

app.get("/", (req, res) => {
  res.send("Thrilloteca API funcionando")
})

// SIN candado: registro y login tienen que estar abiertos
app.use("/api", usuariosRouter)

// CON candado: exigi el token para operar con los libros
app.use("/api/items", pedirToken, itemsRouter)

// CON candado: las reseñas también
app.use("/api/resenas", pedirToken, resenasRouter)

// 404 general
app.use((req, res) => {
  res.status(404).json({ mensaje: "esa ruta no existe" })
})

// Errores inesperados
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ mensaje: "algo salió mal en el servidor" })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("Servidor en http://localhost:" + PORT)
})