const { Router } = require('express');
const ctrlUser = require("../controllers/user.controller")
const router = Router();

router.route('/checkUserData/:userId')
		.get(ctrlUser.checkUserData)

router.route('/potenciales-inquilinos/:propiedadId/:usuarioId')
    .get(ctrlUser.getPotencialesInquilinos);

router.route('/aceptar-inquilino')
    .post(ctrlUser.aceptarInquilino);

    router.route("/mobiliario/comprar/:userId/:propiedadId")
    .post(ctrlUser.comprarMobiliario)

router.route("/inquilinos/:propiedadId/:userId")
    .get(ctrlUser.getInquilinoByPropiedad)

router.route("/mobiliario/:propiedadId/:userId")
    .get(ctrlUser.getMobiliarioByPropiedad)

router.route("/mobiliario/:propiedadId/:userId")
    .get(ctrlUser.getMobiliarioByPropiedad)

router.route("/mobiliario/lista/compra/:userId")
    .get(ctrlUser.getMobiliarioParaCompra)

    router.route("/pagos/alquileres/:userId")
    .get(ctrlUser.actualizarAlquileres)



module.exports = router;