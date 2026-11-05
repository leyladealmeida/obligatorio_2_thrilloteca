//ES UN MIDDLEWARE COMÚN, de los de la clase 7: recibe (req, res, next).
//  Lo único que hace es decidir si el pedido SIGUE o SE CORTA:
//
//      next()            -> seguí, estás autorizado
//      res.status(401)   -> no seguís (y sin next, el pedido termina acá)
//
//  El token viaja en una cabecera, no en el body ni en la URL:
//
//      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
//                     ^^^^^^ la palabra Bearer, un espacio, y el token