let express = require("express");

let app = express();

let mdAutenticacion = require('../middlewares/autenticacion');

let Medico = require('../models/medico');
let Usuario = require('../models/usuario')
let Hospital = require('../models/hospital');

// GET TODOS LOS MEDICOS
app.get('/', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email', Usuario)
        .populate('hospital', Hospital)
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando medicos.",
                    errors: err
                });
            } else {

                Medico.count({}, (err, conteo) => {
                    return res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                })
            }
        });

});

//ACTUALIZACION MEDICOS
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error buscando id del medico.",
                errors: err
            })
        }

        if (!medico) {
            return res.status().json({
                ok: false,
                mensaje: "El hospital con el id " + id + " no existe.",
                errors: { message: "No existe un medico con ese ID" },
            });
        }

        medico.nombre = body.nombre;
        // medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al actualizar medico.",
                    errors: err
                });
            } else {
                return res.status(200).json({
                    ok: true,
                    medico: medicoGuardado,
                });
            }

        })
    })

});


// CREAR MEDICOS
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    let body = req.body;

    let medico = new Medico({
        nombre: body.nombre,
        // img: body.img,
        usuario: req.usuario,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al grabar medico.",
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });
    });

});

//BORRAR MEDICOS
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar medico.",
                errors: err,
            });
        }

        if (!medicoEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un medico con ese id.",
                errors: { message: "No existe un medico con ese id." },
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoEncontrado,
        });

    });
});


module.exports = app;