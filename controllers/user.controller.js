const mongoose = require("mongoose");
const User = require("../models/user.model");
const Propiedad = require("../models/propiedad.model");
const Mobiliario = require("../models/mobiliario.model");
const Inquilino = require("../models/inquilinos.model")

const userCtrl = {};

// **Verificar datos del usuario y actualizar si no tiene propiedades**
userCtrl.checkUserData = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("🔍 Verificando datos para el usuario con ID:", userId);

        // Buscar usuario por ID
        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        console.log("✅ Usuario encontrado:", user.nombre);

        let propiedadesAsignadas = false; // Bandera para saber si se asignaron nuevas propiedades

        // Si el usuario no tiene propiedades, agregar por defecto
        if (!user.propiedades || user.propiedades.length === 0) {
            console.log("⚠️ El usuario no tiene propiedades. Agregando propiedades por defecto...");

            const nuevasPropiedades = [
                { _id: new mongoose.Types.ObjectId("67c4adfefaa027dd2183a129"), alquilado: 0, inquilino: null, tiempo_contrato: null, mobiliario: [new mongoose.Types.ObjectId("67c4c52afaa027dd2183a12c")] },
                { _id: new mongoose.Types.ObjectId("67c4adfefaa027dd2183a129"), alquilado: 0, inquilino: null, tiempo_contrato: null, mobiliario: [new mongoose.Types.ObjectId("67c4c52afaa027dd2183a12c")] },
                { _id: new mongoose.Types.ObjectId("67c4adfefaa027dd2183a129"), alquilado: 0, inquilino: null, tiempo_contrato: null, mobiliario: [new mongoose.Types.ObjectId("67c4c52afaa027dd2183a12c")] }
            ];

            // Guardar en la base de datos
            await User.findByIdAndUpdate(userId, { propiedades: nuevasPropiedades });

            console.log("✅ Propiedades agregadas correctamente");
            user.propiedades = nuevasPropiedades;
            propiedadesAsignadas = true; // Cambiar bandera
        }

        // Obtener los IDs de propiedades
        const propiedadIds = user.propiedades.map(prop => prop._id);

        // Buscar detalles de las propiedades
        const propiedades = await Propiedad.find({ _id: { $in: propiedadIds } }, "nombre valor nombre_imagen").lean();

        // Obtener todos los IDs de mobiliario de las propiedades
        const mobiliarioIds = user.propiedades.flatMap(prop => prop.mobiliario.map(id => id.toString()));

        // Buscar detalles del mobiliario
        const mobiliarios = await Mobiliario.find({ _id: { $in: mobiliarioIds } }, "nombre precio nombre_imagen").lean();

        console.log("✅ Mobiliario encontrado:", mobiliarios);

        // Asociar cada propiedad con sus muebles
        const propiedadesConMobiliario = user.propiedades.map(prop => {
            const detallesPropiedad = propiedades.find(p => p._id.toString() === prop._id.toString()) || {};
            
            return {
                ...detallesPropiedad,
                alquilado: prop.alquilado,
                mobiliario: mobiliarios.filter(mob => prop.mobiliario.some(id => id.toString() === mob._id.toString()))
            };
        });

        return res.json({
            message: propiedadesAsignadas ? "Propiedades agregadas correctamente" : "El usuario ya tiene propiedades",
            usuario: {
                id: user._id,
                nombre: user.nombre,
                dinero: user.dinero,
                nivel: user.nivel,
                propiedades: propiedadesConMobiliario, // ✅ Ahora incluye correctamente sus muebles
            }
        });

    } catch (error) {
        console.error("❌ Error al verificar usuario:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};


userCtrl.getPotencialesInquilinos = async (req, res) => {
    try {
        const { propiedadId, usuarioId } = req.params;

        // Obtener el usuario
        const usuario = await User.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Obtener la propiedad específica
        const propiedad = await Propiedad.findById(propiedadId);
        if (!propiedad) {
            return res.status(404).json({ message: "Propiedad no encontrada" });
        }

        // Buscar inquilinos que cumplan con los criterios
        const inquilinos = await Inquilino.find({
            nivel_requerido: { $lte: usuario.nivel }, // Nivel igual o menor que el usuario
            capacidad_pago: { $gte: propiedad.valor } // Puede pagar el alquiler
        });

        res.json({
            message: "Lista de potenciales inquilinos",
            propiedad: {
                id: propiedad._id,
                nombre: propiedad.nombre,
                valor: propiedad.valor
            },
            inquilinos: inquilinos
        });

    } catch (error) {
        console.error("❌ Error al obtener inquilinos:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

userCtrl.aceptarInquilino = async (req, res) => {
    try {
        const { userId, propiedadId, inquilinoId } = req.body;

        console.log("📌 Aceptando inquilino:", { userId, propiedadId, inquilinoId });

        // Verificar que el usuario existe
        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar que la propiedad existe en el array de propiedades del usuario
        const propiedad = usuario.propiedades.filter(p => p.inquilino && p.tiempo_contrato);
        if (!propiedad) {
            return res.status(404).json({ message: "Propiedad no encontrada en el usuario" });
        }

        // Obtener los datos del inquilino
        const inquilino = await Inquilino.findById(inquilinoId);
        if (!inquilino) {
            return res.status(404).json({ message: "Inquilino no encontrado" });
        }

        // Actualizar solo la propiedad específica dentro del array `propiedades`
        console.log("🔍 Propiedades antes de guardar:", usuario.propiedades);
        await User.findOneAndUpdate(
            { _id: userId, "propiedades._id": propiedadId },
            {
                $set: {
                    "propiedades.$.inquilino": inquilino._id,
                    "propiedades.$.tiempo_contrato": inquilino.tiempo_contrato,
                    "propiedades.$.alquilado": 1
                }
            },
            { new: true, runValidators: true } // Opciones para devolver el documento actualizado y ejecutar validaciones de Mongoose
        );
        
        //await usuario.save({ validateBeforeSave: false });

        console.log("✅ Inquilino asignado correctamente");

        res.json({ message: "Contrato aceptado correctamente" });
    } catch (error) {
        console.error("❌ Error al aceptar el contrato:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

userCtrl.getInquilinoByPropiedad = async (req, res) => {
    console.log("********************************")
    try {
        const { propiedadId, userId } = req.params;
        console.log(`📌 Buscando inquilino para la propiedad: ${propiedadId} del usuario: ${userId}`);

        const usuario = await User.findById(userId);
        if (!usuario) {
            console.warn("⚠️ Usuario no encontrado en la base de datos.");
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        console.log("✅ Usuario encontrado:", usuario.email);

        const propiedad = usuario.propiedades.find(p => p._id.toString() === propiedadId);
        if (!propiedad) {
            console.warn("⚠️ Propiedad no encontrada en el usuario.");
            return res.status(404).json({ message: "Propiedad no encontrada en el usuario" });
        }

        console.log("✅ Propiedad encontrada:", propiedad.nombre);

        if (!propiedad.inquilino) {
            console.warn("⚠️ Propiedad sin inquilino asignado.");
            return res.json({ message: "Esta propiedad no tiene un inquilino asignado", inquilino: null });
        }

        const inquilino = await Inquilino.findById(propiedad.inquilino).lean();
        if (!inquilino) {
            console.warn("⚠️ Inquilino no encontrado en la base de datos.");
            return res.status(404).json({ message: "Inquilino no encontrado" });
        }

        console.log("✅ Inquilino encontrado:", inquilino.nombre);
        return res.json({ inquilino });

    } catch (error) {
        console.error("❌ Error en el servidor:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

userCtrl.getMobiliarioByPropiedad = async (req, res) => {
    try {
        const { propiedadId, userId } = req.params;

        console.log(`📌 Buscando mobiliario para la propiedad: ${propiedadId} del usuario: ${userId}`);

        // Buscar el usuario en la base de datos
        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Buscar la propiedad en el array de propiedades del usuario
        const propiedad = usuario.propiedades.find(p => p._id.toString() === propiedadId);
        if (!propiedad) {
            return res.status(404).json({ message: "Propiedad no encontrada en el usuario" });
        }

        console.log("✅ Propiedad encontrada:", propiedad.nombre);

        if (!propiedad.mobiliario || propiedad.mobiliario.length === 0) {
            return res.json({ message: "Esta propiedad no tiene mobiliario asignado", mobiliario: [] });
        }

        // Buscar los objetos de mobiliario en la colección de mobiliarios
        const mobiliario = await Mobiliario.find({ _id: { $in: propiedad.mobiliario } }).lean();

        console.log("✅ Mobiliario encontrado:", mobiliario);

        return res.json({ mobiliario });
    } catch (error) {
        console.error("❌ Error al obtener mobiliario:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

userCtrl.getMobiliarioParaCompra = async (req, res) => {
    console.log("+==============================")
    try {
        const { userId } = req.params;

        console.log(`📌 Buscando mobiliarios disponibles para usuario: ${userId}`);

        // Obtener datos del usuario
        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Filtrar mobiliario que el usuario puede comprar según su nivel
        const mobiliariosDisponibles = await Mobiliario.find({ nivel_acceso: usuario.nivel }).lean();
        
        console.log("✅ Mobiliarios disponibles para compra:", mobiliariosDisponibles);
        return res.json({ mobiliarios: mobiliariosDisponibles, dinero: usuario.dinero });
    } catch (error) {
        console.error("❌ Error al obtener mobiliarios para compra:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

// 📌 Comprar mobiliario y actualizar el usuario
userCtrl.comprarMobiliario = async (req, res) => {
    try {
        const { userId, propiedadId } = req.params;
        const { mobiliarioIds } = req.body;

        console.log(`📌 Usuario ${userId} intenta comprar mobiliario para propiedad ${propiedadId}`);

        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const propiedad = usuario.propiedades.find(p => p._id.toString() === propiedadId);
        if (!propiedad) {
            return res.status(404).json({ message: "Propiedad no encontrada en el usuario" });
        }

        const mobiliariosAComprar = await Mobiliario.find({ _id: { $in: mobiliarioIds } });
        const totalCosto = mobiliariosAComprar.reduce((sum, mob) => sum + mob.precio, 0);

        if (totalCosto > usuario.dinero) {
            return res.status(400).json({ message: "No tienes suficiente dinero para esta compra" });
        }

        // Descontar dinero y agregar mobiliario a la propiedad
        usuario.dinero -= totalCosto;
        propiedad.mobiliario.push(...mobiliarioIds);

        await User.findOneAndUpdate(
            { _id: userId, "propiedades._id": propiedadId },
            { 
              $inc: { dinero: -totalCosto },
              $push: { "propiedades.$.mobiliario": { $each: mobiliarioIds } }
            },
            { new: true, runValidators: false } // 🔥 Desactiva validaciones innecesarias
          );
        console.log("✅ Compra realizada con éxito. Nuevo saldo:", usuario.dinero);
        return res.json({ message: "Compra exitosa", dineroRestante: usuario.dinero });
    } catch (error) {
        console.error("❌ Error al comprar mobiliario:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

userCtrl.actualizarAlquileres = async (req, res) => {
    try {
        const { userId } = req.params;

        // Buscar el usuario por ID
        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ message: "😢 Usuario no encontrado" });
        }

        // Filtrar solo las propiedades alquiladas
        const propiedadesAlquiladas = usuario.propiedades.filter(p => p.alquilado === 1);
        if (propiedadesAlquiladas.length === 0) {
            return res.json({ 
                message: "No hay propiedades alquiladas, ¡consigue inquilinos! 🏠",
                dinero: usuario.dinero,
                experiencia: usuario.experiencia
            });
        }

        // Obtener información de las propiedades desde la colección `Propiedades`
        const propiedadesIds = propiedadesAlquiladas.map(p => p._id);
        const propiedadesInfo = await Propiedad.find({ _id: { $in: propiedadesIds } });

        // Verificar si se encontraron las propiedades
        if (propiedadesInfo.length === 0) {
            return res.status(404).json({ message: "No se encontraron las propiedades en la base de datos" });
        }

        // Sumar dinero y experiencia
        let totalPago = 0;
        let totalExperiencia = 0;

        propiedadesInfo.forEach(prop => {
            totalPago += Number(prop.valor) || 0;
            totalExperiencia += Number(prop.experiencia) || 0;
        });

        console.log(`💰 Dinero antes de actualizar: ${usuario.dinero}`);
        console.log(`🏠 Total pago calculado: ${totalPago}`);
        console.log(`🌟 Experiencia antes de actualizar: ${usuario.experiencia}`);
        console.log(`📈 Experiencia ganada: ${totalExperiencia}`);

        // Actualizar dinero y experiencia del usuario sin tocar `propiedades`
        await User.updateOne(
            { _id: userId },
            {
                $inc: {
                    dinero: totalPago,
                    experiencia: totalExperiencia
                }
            }
        );

        console.log(`✅ Alquileres cobrados: +$${totalPago} | Experiencia ganada: +${totalExperiencia}`);

        return res.json({
            message: `💰 ¡Has cobrado $${totalPago} de alquiler! Tu experiencia aumentó en ${totalExperiencia} XP 🚀`,
            dinero: usuario.dinero + totalPago,
            experiencia: usuario.experiencia + totalExperiencia
        });

    } catch (error) {
        console.error("❌ Error al actualizar alquileres:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};




module.exports = userCtrl;