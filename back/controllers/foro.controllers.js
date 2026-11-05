//  EL MOZO. Su único trabajo es hablar con el cliente.
//
//  Lo que SÍ sabe:   req, res, los códigos 200 / 201 / 400 / 404 / 500.
//  Lo que NO sabe:   las reglas del restaurante ni dónde están los datos.
//
//  Las cinco funciones tienen exactamente la misma forma:
//     1) sacar de req lo que hace falta
//     2) pedírselo al service (con await)
//     3) responder
//     4) si el service tiró un error, atraparlo y elegir el código

// EL CONTROLLER ES EL ÚNICO QUE CONOCE req. El service no sabe que
//  existe Express, así que no puede ir a buscar el usuario solo: hay
//  que alcanzárselo.
//
//  De dónde sale ese req.usuario: lo dejó puesto el middleware
//  pedirToken cuando abrió el token, antes de que el pedido llegara
//  hasta acá. Mirá middlewares/autorizacion.middleware.js.
//
//  Y fijate lo que el controller NO hace: no compara nada, no decide
//  si la hamburguesa es tuya. Solo transporta el dato. Decidir sigue
//  siendo trabajo del service.