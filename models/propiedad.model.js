const mongoose = require("mongoose");

const propiedadSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  inquilino: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  tiempo_contrato: {
    type: Number,
    required: true,
  },
  tipo: {
    type: String,
    required: true,
    enum: ["residencia", "local"], // Puedes agregar más tipos si es necesario
  },
  valor: {
    type: Number,
    required: true,
  },
  experiencia: {
    type: Number,
    required: true,
  },
  nivel_acceso: {
    type: Number,
    required: true,
    min: 1, // Nivel mínimo de acceso
    max: 3, // Nivel máximo de acceso
  },
  nombre_imagen: {
    type: String,
    required: true, // Nombre de la imagen almacenada en /public/
  },
});

module.exports = mongoose.model("Propiedad", propiedadSchema, "propiedades");