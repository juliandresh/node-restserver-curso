
const express = require('express');
const _ = require('underscore');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria')

//===============================
//Mostrar todas las categorías
//===============================
app.get('/categoria', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.find({}, (err, categoriaDB) => {
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!categoriaDB) {
            return res.status(400).json({
                ok:false,
                err
            })
        } 

        res.json({
            ok:true,
            categoria: categoriaDB
        });
    });

});

//===============================
//Mostrar una categoría por ID
//===============================
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!categoriaDB) {
            return res.status(500).json({
                ok:false,
                err: {
                    message:'El id no es correcto'
                }
            })
        } 

        res.json({
            ok:true,
            categoria: categoriaDB
        });
    });
});


//===============================
//Crear nueva categoría
//===============================
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if(err) {
            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!categoriaDB) {
            return res.status(400).json({
                ok:false,
                err
            })
        } 

        res.json({
            ok:true,
            categoria: categoriaDB
        });

    });
});


//===============================
//Actualizar una categoría 
//===============================
app.put('/categoria/:id', (req, res) => {
    let id = req.params.id;
    
    //With underscore library and pick method is posible to return a copy of the object filtering the fields I want.
    //['nombre', 'email', 'img', 'role', 'estado'] ==> options I want to submit to update
    let body = _.pick(req.body, ['descripcion', 'usuario']);

    let descCategoria = {
        descripcion: body.descripcion
    };

    //{new:true} return the modified document rather than the original
    //{runValidators:true} if true, runs update validators on this command. Update validators
    //validate the update operation against the model's schema
    Categoria.findByIdAndUpdate(id, descCategoria, {new:true, runValidators:true }, (err, categoriaDB) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB) {
            return res.status(400).json({
                ok:false,
                err
            })
        } 

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});



//===============================
//Eliminar una categoría 
//===============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    //solo un administrador puede borrar las categorías
    //Categoria.finByIdAndRemove

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !categoriaDB ) {
            return res.status(400).json({
                ok:false,
                err
            })
        } 

        res.json({
            ok: true,
            message: 'Categoría borrada'        
        });
    });
});



module.exports = app;