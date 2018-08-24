const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path'); 
const fs = require('fs'); 

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options
app.use(fileUpload());
 
app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo' 
            }
        });
    }
 
    //Valida tipo
    let tiposValidos = ['productos','usuarios'];
    if ( tiposValidos.indexOf( tipo ) < 0 ){
        return res.status(400).json({
            ok: false, 
            err:{
                message:'Los tipos permitidos son '+ tiposValidos.join(', ')
            }
            
        });
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo;


    let nombreCortado =archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];
    

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if( extensionesValidas.indexOf(extension) <0 ){
        return res.status(400).json({
            ok: false, 
            message:'Las extensiones permitidas son '+ extensionesValidas.join(', '),
            ext: extension
        })
    }
    
    //Cambiar el nombre al archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;
    
    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err)
        return res.status(500).json({
            ok: false,
            err
        });
        
        //Aquí se que la imagen se cargó
        switch(tipo) {
            case 'usuarios':
                imagenUsuario(id, res, tipo, nombreArchivo);
                break;
            case 'productos':
                imagenProductos(id, res, tipo, nombreArchivo);
                break;
            default:                
        }        
        
    });
});

function imagenUsuario(id, res, tipo, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if(err) {
            borrarArchivo(nombreArchivo, tipo);
            return res.status(500).json({
                ok:false, 
                err
            })
        }

        if(!usuarioDB) {
            borrarArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok:false, 
                err: {
                    message: 'Usuario no existe'
                }
            })
        }


        borrarArchivo(usuarioDB.img, tipo);

        usuarioDB.img = nombreArchivo;
        
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok:true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        });
    });

}


function borrarArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if( fs.existsSync(pathImagen) ) {
        fs.unlinkSync(pathImagen);
    }
}

function imagenProductos(id, res, tipo, nombreArchivo) {     
    Producto.findById(id, (err, productoDB) => {
        if(err) {
            borrarArchivo(nombreArchivo, tipo);
            return res.status(500).json({
                ok: false,
                err 
            });
        }

        if(!productoDB) {                        
            borrarArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok:false, 
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borrarArchivo(productoDB.img, tipo);
        productoDB.img = nombreArchivo ;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok:true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        });

    });
}

module.exports = app;