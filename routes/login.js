let express = require("express");

let app = express();
let bcrypt = require("bcryptjs");
let jwt = require('jsonwebtoken')

let SEED = require('../config/config').SEED;

let Usuario = require("../models/usuario");

//GOOGLE
let CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


//AUTENTICACION DE GOOGLE
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload["sub"];
    // If request specified a G Suite domain:
    //const domain = payload['hd']; 

    return {
        nombre: payload.nombre,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    let token = req.body.token;

    let googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: true,
                mensaje: "Token no valido",
            });
        })

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario.",
                errors: err,
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe usar su autenticacion normal.",
                    errors: err,
                });
            } else {
                let token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400,
                }); //4 horas
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id,
                });
            }
        } else {
            // El usuario no existe hay que crearlo
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            if (!usuario.nombre) {
                usuario.nombre = googleUser.email
            }
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ":)";

            // console.log(googleUser);
            // console.log(usuario);
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al buscar usuario2.",
                        errors: err,
                    });
                }

                let token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expireIn: 14400,
                });
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id,
                });
            })
        }
    })


})

//AUTENTICACION NORMAL
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