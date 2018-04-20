const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({

    name: RequiredString,
    company: String,
    
});

module.exports = mongoose.model('Reviewer', schema);