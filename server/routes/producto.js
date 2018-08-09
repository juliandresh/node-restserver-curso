const express = require('express');
const Producto = require('../models/producto');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const app = express();


//===============================
//Buscar productos
//===============================
app.get('/productos/buscar/:termino', verificaToken, (req, res) =>{

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({nombre : regex})
    .populate('categoria', 'nombre')
    .exec( (err, productos) => {
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true, 
            productos
        })
    });



});


//===============================
//Crear un nuevo producto
//===============================

app.post('/producto', verificaToken, (req, res) => {
    
    let body = req.body;
    
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,    
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    })
    producto.save((err, productoDB) =>{
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            })
        }
    
        if(!productoDB) {
            return res.status(400).json({
                ok:false,
                err
            })
        } 
    
        res.json({
            ok:true,
            producto: productoDB
        });
    });

});



//===============================
//Actualizar un producto
//===============================
app.put('/producto/:id', verificaToken, (req, res) => {
    
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            })
        }
    
        if(!productoDB) {
            return res.status(400).json({
                ok:false,
                err
            })
        } 
        
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            if(err) {
                return res.status(500).json({
                    ok:false,
                    err
                })
            }

            res.json({
                ok: true,
                producto: productoGuardado
            })
        });

    });
});


//===============================
// Obtener productos
//===============================
app.get('/productos', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
            .skip(desde)
            .limit(5)
            .populate('usuario', 'nombre email')
            .populate('categoria', 'descripcion')
            .exec((err, productos) => {
                if(err) {
                    return res.status(500).json({
                        ok:false,
                        err
                    })
                }
    
                res.json({
                    ok: true,
                    productos
                })
            });
});

//===============================
// Obtener producto por ID
//===============================
app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id) 
            .populate('usuario', 'nombre email')
            .populate('categoria', 'descripcion')
            .exec((err, productoDB) => 
            {
                if(err) {
                    return res.status(500).json({
                        ok:false,
                        err
                    });
                }

                if( !productoDB ) {
                    return res.status(400).json({
                        ok:false,
                        err: {
                            message: 'ID no existe'
                        }
                    });
                }

                res.json({
                    ok: true,
                    producto: productoDB
                });        
            });    
    });

//===============================
// Eliminar productos
//===============================

app.delete('/producto/:id', verificaToken, (req, res) =>{
    
    let id = req.params.id;
   
    Producto.findById(id, (err, productoDB) => {
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if( !productoDB ) {
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save( (err, productoBorrado) => {
            if(err) {
                return res.status(500).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            })
        })
    });
});

module.exports = app;