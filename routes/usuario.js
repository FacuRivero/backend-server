let express = require("express");

let app = express();
let bcrypt = require('bcryptjs');
let jwt = require("jsonwebtoken");

let mdAutenticacion = require('../middlewares/autenticacion');

let Usuario = require('../models/usuario')

// OBTENER TODOS LOS USUARIOS
app.get("/", (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando usuarios.",
                    errors: err
                });
            } else {

                Usuario.count({}, (err, conteo) => {
                    return res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                })


            }
        })

});


// ACTUALZIAR USUARIO
app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdminRole_oMismoUsuario], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario.",
                errors: err,
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario con el id " + id + " no existe.",
                errors: { message: "No existe un usuario con ese ID" },
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario.",
                    errors: err,
                });
            }

            usuarioGuardado.password = ":)";

            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
            });
        });
    });

});

// CREAR UN NUEVO USUARIO

app.post('/', (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario.",
                errors: err,
            });
        }
        return res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });

})

// BORRAR USUARIO

app.delete("/:id", [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdminRole_oMismoUsuario], (req, res) => {
    let id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar usuario.",
                errors: err,
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un usuario con ese id.",
                errors: { message: "No existe un usuario con ese id." },
            });
        }

        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
        });
    });
});



module.exports = app;