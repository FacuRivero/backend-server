// Requires
let express = require('express');
let mongoose = require('mongoose');


// Inicializar variables
let app = express();

//Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log("Base de datos: online");
});

// Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente.'
    })

})

//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000 online');
});