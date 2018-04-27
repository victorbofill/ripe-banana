const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');
const { sortActor } = require('./aggregations');

const schema = new Schema({

    name: RequiredString,
    dob: Date,
    pob: {
        type: String,
        maxlength: 20
    },

});

schema.statics = {
    findActors() {
        return this.aggregate(sortActor());
    },
};

module.exports = mongoose.model('Actor', schema);