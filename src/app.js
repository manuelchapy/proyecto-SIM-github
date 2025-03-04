const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
app.set('port', process.env.PORT || 3000);

// middlewares
app.use(express.urlencoded({extended: false}));	
app.use(cors()); //cada vez que llegue una petición a mi servidor va permitir poder enviar y recibir datos
app.options('*', cors());
app.use(express.json()); //desde mi servidor se puede ver info en formato json y string

app.use('/api', require("../routes/index.route"));
app.use('/api', require("../routes/auth.route"));
app.use('/api', require("../routes/user.route"))
module.exports = app;