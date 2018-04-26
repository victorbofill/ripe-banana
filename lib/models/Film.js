const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');
const { filmAvg } = require('./aggregations');

const schema = new Schema({

    title: RequiredString,
    studio: { type: Schema.Types.ObjectId, ref: 'Studio' },
    released: {
        type: Number,
        min: 1000,
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

schema.statics = {
    findFilmById() {
        return this.aggregate(filmAvg());
    },

    findTopFilms() {
        return this.aggregate(filmAvg('top'));
    }
};

module.exports = mongoose.model('Film', schema);