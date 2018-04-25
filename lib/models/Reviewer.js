const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');
const bcrypt = require('bcryptjs');
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
    hash: String,
    role: {
        type: String,
        enum: ['admin', 'user'],
        required: true
    }
    
});

schema.methods = {
    generateHash(password) {
        this.hash = bcrypt.hashSync(password, 8);
    },
    comparePassword(password) {
        return bcrypt.compareSync(password, this.hash);
    }
};

module.exports = mongoose.model('Reviewer', schema);