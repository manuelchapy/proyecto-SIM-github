const mongoose = require("mongoose");

const mobiliarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  precio: {
    type: Number,
    required: true
  },
  experiencia: {
    type: Number,
    required: true
  },
  nivel_acceso: {
    type: Number,
    required: true
  },
  nombre_imagen: {
    type: String,
    required: true // Nombre de la imagen (ej. "cortina-blackout.jpg")
  }
});

// Exportar el modelo
module.exports = mongoose.model("Mobiliario", mobiliarioSchema, "mobiliarios");