let express = require("express");

let app = express();

let mdAutenticacion = require('../middlewares/autenticacion');

let Hospital = require('../models/hospital');
let Usuario = require('../models/usuario')

// GET TODOS LOS HOSPITALES
app.get('/', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(50)
        .populate('usuario', 'nombre email', Usuario)
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando hospitales.",
                    errors: err
                });
            } else {
                Hospital.count({}, (err, conteo) => {
                    return res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                })
            }
        });

});

// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email', Usuario)
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: {
                        message: 'No existe un hospitalcon ese ID'
                    }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
})

//ACTUALIZACION HOSPITALES
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error buscando id del hospitales.",
                errors: err
            })
        }

        if (!hospital) {
            return res.status().json({
                ok: false,
                mensaje: "El hospital con el id " + id + " no existe.",
                errors: { message: "No existe un hospital con ese ID" }
            });
        }

        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al actualizar hospitales.",
                    errors: err
                });
            } else {
                return res.status(200).json({
                    ok: true,
                    hospital: hospitalGuardado
                });
            }

        })
    })

});


// CREAR HOSPITAL
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    let body = req.body;

    let hospital = new Hospital({
        nombre: body.nombre,
        // img: body.img,
        usuario: req.usuario
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al grabar hospital.",
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });
    });

});

//BORRAR HOSPITAL
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar hospital.",
                errors: err,
            });
        }

        if (!hospitalEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un hospital con ese id.",
                errors: { message: "No existe un hospital con ese id." },
            });
        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalEncontrado,
        });

    });
});


module.exports = app;