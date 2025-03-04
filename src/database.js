require('dotenv').config();
const mongoose = require('mongoose');

let uri = "mongodb+srv://chapy:24781279@db-test.12ub73d.mongodb.net/simulacionDB?retryWrites=true&w=majority"
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then((connection) => {
  console.log("✅ Conectado a MongoDB Atlas");
  console.log(`📌 Base de datos activa: ${connection.connection.name}`); // Muestra el nombre de la DB
})
.catch(err => console.error("❌ Error de conexión:", err));
