const mongoose = require("mongoose");

const inquilinoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  capacidad_pago: { type: Number, required: true }, // Cuánto puede pagar
  tiempo_contrato: { type: Number, required: true }, // Meses de contrato
  nivel_requerido: { type: Number, required: true }, // Nivel mínimo del usuario para aceptar el alquiler
});

// ✅ Exportar el modelo
module.exports = mongoose.model("Inquilino", inquilinoSchema, "pontenciales_inquilinos");