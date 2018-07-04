const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

const app = require('express');

let ciudadSchema = new Schema({
    nombreCiudad : {
        type: String,
        unique: true,
        required: [true, 'EL nombre de la ciudad es necesario']
    },
    estado: {
        type: Boolean,
        default: true
    }
});

ciudadSchema.plugin(uniqueValidator, { message: 'El {PATH} debe ser único'});
module.exports = mongoose.model('Ciudad', ciudadSchema);