//  Lo único que hace es decidir si el pedido SIGUE o SE CORTA:
//
//      next()            -> seguí, estás autorizado
//      res.status(401)   -> no seguís (y sin next, el pedido termina acá)
//
//  El token viaja en una cabecera, no en el body ni en la URL:
//
//      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
//                     ^^^^^^ la palabra Bearer, un espacio, y el token

import jwt from "jsonwebtoken"

export function pedirToken(req, res, next) {
  // El token viene en los headers con el formato "Authorization: Bearer <TOKEN>"
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(" ")[1] 
  //el 1 basicamente agarra la segunda parte del texto de token, 
 //que es la parte limpia, y usa esa, descartanto la palabra Bearer

  if (!token) {
    return res.status(401).json({ mensaje: "acceso denegado: falta el token de autenticación" })
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decodificado // Guarda { id: usuario._id } para usarlo en los servicios
    next()
  } catch (error) {
    return res.status(401).json({ mensaje: "token inválido o expirado" })
  }
}