require('./config/config')

const express = require('express')
const app = express();
const mongoose = require('mongoose')

const bodyParser = require('body-parser');

const path = require('path');
 
//parse application/x-www-form-urlencoded ==> Middleware
app.use(bodyParser.urlencoded( { extended: false} ));

//parse application/json ==> Middleware
app.use(bodyParser.json());

app.use(require('./routes/index'));

//habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, './public')));
//console.log(path.resolve(__dirname, '../public'));

mongoose.connect(process.env.URLDB, (err, res) => {
    if(err) throw err;

    console.log('Base de datos ONLINE');
});


app.listen(process.env.PORT, () => {
    console.log('Escuchando en puerto: ', process.env.PORT);
});