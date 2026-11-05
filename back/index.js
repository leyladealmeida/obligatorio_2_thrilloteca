//      el restaurante abre la puerta a cualquiera que quiera
//      registrarse o entrar, pero a la COCINA solo se pasa con token.
//
//  Lo que ya traía de la clase 9:
//      1) leemos el archivo .env  (dotenv)   <- hoy suma JWT_SECRET
//      2) nos conectamos a la base ANTES de abrir el servidor
//      3) el puerto sale del .env en vez de estar escrito acá
//
//  Y de antes: los middlewares, el 404 general y el middleware de
//  errores, que no se tocan.
//
//  Cómo prenderlo (en la terminal, parados en la carpeta back/):
//      npm install     -> SOLO la primera vez
//      (copiar .env.ejemplo a .env y completar la dirección de la base)
//      npm run dev     -> prende el servidor con nodemon
//  Para apagarlo: Ctrl + C.