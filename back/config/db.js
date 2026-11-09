///ESTE ARCHIVO ES SOLO PARA QUE SE CONECTE A MONGOOSE

import mongoose from "mongoose"
import dns from "dns"

// Forzar a Node a usar los servidores DNS públicos de Google para resolver el registro SRV
dns.setServers(["8.8.8.8", "8.8.4.4"])
dns.setDefaultResultOrder("ipv4first")

export async function conectarBase() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Conectado a MongoDB Atlas")
  } catch (error) {
    console.log("NO se pudo conectar a la base:")
    console.log(error.message)
    process.exit(1)
  }
}