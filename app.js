// Requires
let express = require('express');
let mongoose = require('mongoose');
var bodyParser = require("body-parser");

// Inicializar variables
let app = express();


//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log("Base de datos: online");
});

//Importar rutas
let appRoutes = require('./routes/app');
let usuariosRotues = require("./routes/usuario");
let loginRotues = require("./routes/login");

// Rutas
app.use("/usuario", usuariosRotues);
app.use("/login", loginRotues);
app.use('/', appRoutes);

//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000 online');
});