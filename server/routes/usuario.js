const express = require('express');
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const app = express();

app.get('/usuario', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;//Si viene la variable la usa, si no usamos la página 0 
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite= Number(limite);

    Usuario.find({estado:true}, 'nombre email role estado google img')
        .skip(desde) // Se salta los primeros 5 registros
        .limit(limite) //Muestra solo 5 registros
        .exec((err, usuarios) => {
            if( err ) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({estado:true},(err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });

            
        })   
});

app.post('/usuario', [verificaToken, verificaAdmin_Role],  (req, res)=> {

    let body = req.body;
    
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });
    
    usuario.save((err, usuarioDB) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role],  (req, res) => {

    let id = req.params.id;

    //With underscore library and pick method is posible to return a copy of the object filtering the fields I want.
    //['nombre', 'email', 'img', 'role', 'estado'] ==> options I want to submit to update
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    
    //{new:true} return the modified document rather than the original
    //{runValidators:true} if true, runs update validators on this command. Update validators
    //validate the update operation against the model's schema
    Usuario.findByIdAndUpdate(id, body, {new:true, runValidators:true, context: 'query'}, (err, usuarioDB) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    
    });
});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;
    
    let cambiaEstado = {
        estado: false
    }

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, cambiaEstado, {new: true}, (err, usuarioBorrado) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });            
        }
        if(!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,            
            usuario: usuarioBorrado
        });
    })

});

module.exports = app;