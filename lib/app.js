const express = require('express');
const app = express();
const errorHandler = require('./util/error-handler');
const checkDb = require('./util/check-connection');

const actors = require('./routes/actors');

app.use(express.json());

app.use('/actors', actors);

app.use(errorHandler());

module.exports = app;