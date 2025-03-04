const mongoose = require("mongoose");

const propiedadSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  alquilado: { type: Number, default: 0 }, // ✅ Agregar el campo alquilado
  mobiliario: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mobiliario" }],
  inquilino: { type: mongoose.Schema.Types.ObjectId, required: true },
  tiempo_contrato: { type: Number, required: true },
});

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nivel: { type: Number, default: 1 },
  experiencia: { type: Number, default: 0 },
  dinero: { type: Number, default: 5000 },
  propiedades: [propiedadSchema], // ✅ Usar el esquema de propiedades
  mobiliarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mobiliario" }],
  transacciones: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaccion" }],
  fecha_creacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema, "usuarios");