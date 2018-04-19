const express = require('express');
const app = express();
const errorHandler = require('./util/error-handler');

app.use(express.json());

app.use(errorHandler());

module.exports = app;