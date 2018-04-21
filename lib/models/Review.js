const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({

    rating: RequiredString,
    reviewer: { type: Schema.Types.ObjectId, ref: 'Reviewer', required: true },
    review: {
        type: String,
        maxlength: 140
    },
    film: { type: Schema.Types.ObjectId, ref: 'Film', required: true },
    created: Date,
    uploaded:{
        type: Date,
        default: Date.now
    }
    
});

module.exports = mongoose.model('Review', schema);