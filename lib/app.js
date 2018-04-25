const express = require('express');
const app = express();
// const morgan = require('morgan');
const errorHandler = require('./util/error-handler');
const createEnsureAuth = require('./util/ensure-auth');
require('./models/register-plugin');

// app.use(morgan('dev'));

const auth = require('./routes/auth');
const actors = require('./routes/actors');
const reviewers = require('./routes/reviewers');
const reviews = require('./routes/reviews');
const films = require('./routes/films');
const studios = require('./routes/studios');

const ensureAuth = createEnsureAuth();

app.use(express.json());

app.use('/auth', auth);
app.use('/actors', actors);
app.use('/reviewers', reviewers);
app.use('/reviews', reviews); //TODO: Add ensureAuth
app.use('/films', films);
app.use('/studios', studios);

app.use(errorHandler());

module.exports = app;