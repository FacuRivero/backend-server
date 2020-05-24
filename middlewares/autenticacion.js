let jwt = require("jsonwebtoken");
let SEED = require("../config/config").SEED;

// VERIFICAR TOKEN
exports.verificaToken = function(req, res, next) {
    let token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: "Token incorrecto.",
                errors: err,
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
}

// VERIFICAR ADMIN o mismo usuario
exports.verificaAdminRole_oMismoUsuario = function(req, res, next) {

    let usuario = req.usuario;
    let id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || id === usuario._id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: "Token incorrecto- .",
            errors: { message: 'No es administrador, no puede hacer esto.' },
        });
    }

}