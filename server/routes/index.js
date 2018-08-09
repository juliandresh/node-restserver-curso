const express = require('express')
const app = express();


app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./login2'));
app.use(require('./ciudad'));
app.use(require('./categoria'));
app.use(require('./producto'));

module.exports = app;