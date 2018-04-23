const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({

    title: RequiredString,
    studio: { type: Schema.Types.ObjectId, ref: 'Studio' },
    released: {
        type: Number,
        max: 9999
    },
    cast: [{
        part: {
            type: String,
            maxlength: 30
        },
        actor: { type: Schema.Types.ObjectId, ref: 'Actor' }
    }]
});

module.exports = mongoose.model('Film', schema);