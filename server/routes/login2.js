const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario')

const app = express();

app.post('/login2', (req, resp) =>{
    let body = req.body;
    
    Usuario.findOne({email: body.email}, (err, usuarioDB) => {
        if(err) {
            resp.status(400).json({
                ok: false,
                err
            })
        }
        if(!usuarioDB) {
            resp.status(400).json({
                ok: false,
                err : {
                    message: '(Usuario) o contraseña invalidos'
                }
            });
        }

        if(!bcrypt.compareSync(body.password, usuarioDB.password)) {
            resp.status(400).json({
                ok: false,
                err : {
                    message: 'Usuario o (contraseña) invalidos'
                }
            });
        }

        let token = jwt.sign({
            usuario:usuarioDB,
        }, process.env.SEED, { expiresIn:process.env.CADUCIDAD_TOKEN } );

        resp.json({
            ok:true,
            usuario: usuarioDB,
            token
        })
    });
});

module.exports = app;