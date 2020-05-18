let express = require("express");

let app = express();
let bcrypt = require("bcryptjs");
let jwt = require('jsonwebtoken')

let SEED = require('../config/config').SEED;

let Usuario = require("../models/usuario");


app.post('/', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario.",
                errors: err,
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - email.",
                errors: err,
            });
        }


        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - password.",
                errors: err,
            });
        }

        //CREAR UN TOKEN
        usuarioDB.password = ':)'
        let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas


        return res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB.id,
            token
        });

    })


})









module.exports = app;