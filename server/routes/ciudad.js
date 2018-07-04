const express = require('express');
const Ciudad = require('../models/ciudad');

const _ = require('underscore');
const app = express();


app.post('/ciudad', (req, res) => {
    
    let body = req.body;

    let ciudad = new Ciudad({
        nombreCiudad : body.nombreCiudad,
        estado: body.estado
    });

    ciudad.save((err, ciudadDB) => {
        if(err)
        {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok:true, 
            ciudad: ciudadDB 
        });    
    });
});

app.put('/ciudad/:id', (req, res) => {


    let id = req.params.id;
    let body = _.pick(req.body, ['nombreCiudad']);    
    
    Ciudad.findByIdAndUpdate(id, body, {new:true, runValidators:true}, (err, ciudadDB) => {
        if(err)
        {
            return res.status(400).json({
                ok:false,
                err
            })
        }
        res.json({
            ok:true,
            ciudad: ciudadDB
        })
    });

});

app.delete('/ciudad/:id', (req, res) => {
    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    };

    Ciudad.findByIdAndUpdate(id, cambiaEstado, {new:true}, (err, ciudadBorrada) => {
        if(err) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        if(!ciudadBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Ciudad no encontrada'
                }
            })
        }
        res.json({
            ok:true,
            ciudad: ciudadBorrada
        })

    });
});

app.get('/ciudad', (req, res) => {
    let body = req.params;
    let id = body.id;

    let desde = req.query.desde || 0;//Si viene la variable la usa, si no usamos la página 0 
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite= Number(limite);

    Ciudad.find({estado:true})
    .skip(desde)
    .limit(limite)
    .exec( (err, ciudades)=> {
        if(err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }

        Ciudad.count({estado:true}, (err, conteo) => {
            res.json({
                ok:true,
                ciudades,
                conteo
            });
        });
 
        

    });
});

module.exports = app;