const { Router } = require('express');
const ctrlIndex = require("../controllers/index.controller")
const router = Router();

router.route('/')
		.get(ctrlIndex.index)

module.exports = router;