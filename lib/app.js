const express = require('express');
const app = express();
const errorHandler = require('./util/error-handler');

const actors = require('./routes/actors');
const studios = require('./routes/studios');

app.use(express.json());

app.use('/actors', actors);

app.use('/studios', studios);

app.use(errorHandler());

module.exports = app;