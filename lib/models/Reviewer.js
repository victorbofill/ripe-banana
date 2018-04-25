const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');
const { isEmail } = require('validator');

const schema = new Schema({

    name: RequiredString,
    company: String,
    email : {
        type: String,
        required: true,
        validate: {
            validator: function(email){
                return isEmail(email);
            },
            message: 'Please fill a valid email address',
            type: 'invalid email format'
        }
    },
    hash: String
    
});

module.exports = mongoose.model('Reviewer', schema);