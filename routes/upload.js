let express = require('express');
let fileupload = require("express-fileupload");
let fs = require('fs');
let app = express();

let Hospital = require('../models/hospital');
let Usuario = require('../models/usuario')
let Medico = require('../models/medico')

//default options
app.use(fileupload());

// Rutas
app.put("/:tipo/:id", (req, res, next) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    //tipos de coleccion
    let tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: "Tipo de coleccion no valida",
            errors: { message: "Tipo de coleccion no valida" },
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: "No selecciono nada",
            errors: { message: 'Debe seleccionar una imaggen' }
        });
    }

    //Obtener nombre del archivo
    let archivo = req.files.imagen;
    let nombreCortado = archivo.name.split('.');
    let extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo estas extenciones estan permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            message: "Extension no valida",
            errors: {
                message: "Las extensiones validas son " + extensionesValidas.join(", "),
            },
        });
    }


    // Nombre de archivo personalizado
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover el archivo a un path especifico
    let path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al mover archivo",
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    })



});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Usuario no existente.",
                    errors: { message: 'usuario no existe' }
                });
            }

            let pathViejo = './uploads/usuarios/' + usuario.img;

            //Si existe una archivo lo elimina
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ":)";

                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizada.",
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "medico no existente.",
                    errors: { message: 'medico no existe' }
                });
            }

            let pathViejo = "./uploads/medicos/" + medico.img;

            //Si existe una archivo lo elimina
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                medicoActualizado.password = ":)";

                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizada.",
                    medico: medicoActualizado,
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "hospital no existente.",
                    errors: { message: "hospital no existe" },
                });
            }

            let pathViejo = "./uploads/hospitales/" + hospital.img;

            //Si existe una archivo lo elimina
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualziado) => {
                hospitalActualziado.password = ":)";

                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de hospital actualizada.",
                    hospital: hospitalActualziado,
                });
            });
        });
    }
}


module.exports = app;