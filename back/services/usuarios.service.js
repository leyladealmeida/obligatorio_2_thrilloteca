import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { buscarPorEmail, guardar, actualizarAvatar } from "../repositories/usuarios.repository.js"
import { AVATARES } from "../models/usuario.js"

// Un error normal, pero con un número adentro (el código HTTP)
function errorCon(status, mensaje) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

// Reglas que se resuelven MIRANDO los datos
function validar(datos) {
  const email = datos.email ? String(datos.email).trim().toLowerCase() : ""
  const password = datos.password ? String(datos.password) : ""

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailValido) {
    throw errorCon(400, "el mail tiene que ser válido")
  }
  if (password.length < 8) {
    throw errorCon(400, "la contraseña tiene que tener al menos 8 caracteres")
  }
  return { email: email, password: password }
}

// Regla que hay que PREGUNTARLE a la base
async function chequearEmailLibre(email) {
  const existente = await buscarPorEmail(email)
  if (existente) {
    throw errorCon(409, "ya existe una cuenta con este mail")
  }
}

// Devuelve el usuario SIN el hash
function sinPassword(usuario) {
  return {
    _id: usuario._id,
    email: usuario.email,
    avatar: usuario.avatar || "img/avatar1.png",
    fechaDeCreacion: usuario.fechaDeCreacion
  }
}

export async function registrarUsuario(datos) {
  const limpios = validar(datos)                     // 1) mirar
  await chequearEmailLibre(limpios.email)            // 2) preguntar
  const hash = await bcrypt.hash(limpios.password, 10)
  const guardado = await guardar({                   // 3) guardar
    email: limpios.email,
    password: hash,                                  // el hash, no la contraseña
    avatar: AVATARES.includes(datos.avatar) ? datos.avatar : "img/avatar1.png"
  })
  return sinPassword(guardado)
}

export async function loginUsuario(datos) {
  const email = datos.email ? String(datos.email).trim().toLowerCase() : ""
  const password = datos.password ? String(datos.password) : ""

  const usuario = await buscarPorEmail(email)
  if (!usuario) {
    throw errorCon(401, "mail o contraseña incorrectos")
  }

  const coincide = await bcrypt.compare(password, usuario.password)
  if (!coincide) {
    throw errorCon(401, "mail o contraseña incorrectos")
  }

  const token = jwt.sign(
    { id: usuario._id },        // qué dice adentro (solo el id)
    process.env.JWT_SECRET,     // con qué se firma
    { expiresIn: "2h" }         // cuánto dura
  )

  return { token: token, usuario: sinPassword(usuario) }
}

export async function cambiarAvatarUsuario(idUsuario, avatar) {
  if (!AVATARES.includes(avatar)) {
    throw errorCon(400, "elegí un avatar válido de la lista")
  }
  const actualizado = await actualizarAvatar(idUsuario, avatar)
  if (!actualizado) {
    throw errorCon(404, "usuario no encontrado")
  }
  return sinPassword(actualizado)
}