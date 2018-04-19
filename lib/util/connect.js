const mongoose = require('mongoose');

module.exports = function(dbUri) {
    mongoose.connection.on('connected', () => {
        console.log('Mongoose default connection open to ' + dbUri);
    });

    mongoose.connection.on('error', (err) => {
        console.log('Mongoose default connection error: ' + err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose default connection disconnected');
    });

    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });
};