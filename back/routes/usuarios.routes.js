//  Tres líneas, pero MIRÁ LA DIFERENCIA ENTRE ELLAS:
//
//      registro y login  ->  LIBRES. Tienen que serlo: si para
//                            registrarte hiciera falta un token, nunca
//                            podrías conseguir el primero.
//
//      /yo               ->  PROTEGIDA. Lleva pedirToken ADELANTE del
//                            controller.
//
//  Esa forma —ruta, middleware, controller— es la de la clase 7:
//      app.METODO(ruta, [middleware(s)], controller)