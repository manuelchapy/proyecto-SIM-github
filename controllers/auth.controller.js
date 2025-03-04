const User = require("../models/user.model"); // ✅ Asegúrate de que la ruta es correcta
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authCtrl = {};

// **Autenticar usuario SIN encriptación**
// **Autenticar usuario SIN encriptación**
authCtrl.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Buscar usuario por correo
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar contraseñas directamente
    if (password !== user.password) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, nombre: user.nombre },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "2h" } // Token válido por 2 horas
    );

    // Guardar en variables de entorno
    process.env.JWT_TOKEN = token;
    process.env.USER_ID = user._id.toString();
    process.env.USER_NOMBRE = user.nombre;
    process.env.USER_EMAIL = user.email;
    process.env.USER_NIVEL = user.nivel.toString();
    process.env.USER_EXPERIENCIA = user.experiencia.toString();
    process.env.USER_DINERO = user.dinero.toString();

    console.log("✅ Variables de entorno actualizadas con datos del usuario");
    console.log("Token JWT:", process.env.JWT_TOKEN);
    console.log("Usuario autenticado:", process.env.USER_NOMBRE);
    console.log("Email:", process.env.USER_EMAIL);
    console.log("Nivel del usuario:", process.env.USER_NIVEL);
    console.log("Experiencia:", process.env.USER_EXPERIENCIA);
    console.log("Dinero:", process.env.USER_DINERO);
    // Responder con los datos del usuario y el token
    res.json({
      message: "Autenticación exitosa",
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        nivel: user.nivel,
        experiencia: user.experiencia,
        dinero: user.dinero,
      },
    });

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = authCtrl;
