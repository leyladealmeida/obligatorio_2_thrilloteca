//  Su único trabajo es decir QUÉ dirección le toca a QUÉ función.
//  Nada más. Es el índice del recurso.
//
//  Fijate que las funciones van SIN los paréntesis:
//      router.get("/", listar)     ✓  "cuando llegue un GET, ejecutá listar"
//      router.get("/", listar())   ✗  ejecutaría listar AHORA, al arrancar
//  Es lo mismo que en addEventListener desde la clase 4.