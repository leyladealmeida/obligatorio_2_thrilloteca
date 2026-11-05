//  EL COCINERO. Su único trabajo es DECIDIR: qué se puede y qué no.
//  Cuando algo está mal NO responde: tira un error (throw).
//  El que atrapa el error y elige el código HTTP sigue siendo el
//  controller, con el mismo catch de la clase 8. Eso no cambió.
//
//  HOY APARECEN DOS REGLAS NUEVAS, Y SON DE CLASES DISTINTAS:
//
//    1) "la categoría tiene que estar en la lista"
//       Se puede contestar MIRANDO los datos que llegaron. Es la misma
//       clase de regla que "el precio tiene que ser mayor a 0".
//
//    2) "no puede haber dos hamburguesas con el mismo nombre"
//       Esta NO se puede contestar mirando los datos. Hay que ir a
//       PREGUNTARLE A LA BASE. Es el tipo de regla nuevo de hoy, y
//       trae un código HTTP nuevo: el 409.
// =====================================================================