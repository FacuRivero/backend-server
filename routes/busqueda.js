let express = require('express');

let app = express();

let Hospital = require('../models/hospital');
let Usuario = require('../models/usuario')
let Medico = require('../models/medico')


// BUSQUEDA POR COLECCION
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    let tabla = req.params.tabla;
    let busqueda = req.params.busqueda;
    let regEx = new RegExp(busqueda, 'i');
    console.log(tabla, busqueda);
    let promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regEx);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regEx);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regEx);
            break;

        default:
            return res.status(400).json({
                ok: false,
                message: 'No se encontro la coleccion'
            });
            break;
    }

    promesa
        .then((data) => {
            res.status(200).json({
                ok: true,
                [tabla]: data
            });
        })
        .catch((err) => console.log("errr", err));

});


// BUSQUEDA GENERAL
app.get("/todo/:busqueda", (req, res, next) => {

    let busqueda = req.params.busqueda;

    let regEx = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regEx),
            buscarMedicos(busqueda, regEx),
            buscarUsuarios(busqueda, regEx)
        ]).then((respuestas) => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })
        .catch((err) => console.log("errr", err))


});

function buscarHospitales(busqueda, regEx) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regEx })
            .populate('usuario', 'nombre email', Usuario)
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err)
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regEx) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regEx })
            .populate('usuario', 'nombre email', Usuario)
            .populate('hospital', Hospital)
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err)
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regEx) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regEx }, { email: regEx }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err)
                } else {
                    resolve(usuarios);
                }
            });
    });
}


module.exports = app;