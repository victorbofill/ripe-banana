const jwt = require('jsonwebtoken');
const APP_SECRET = process.env.APP_SECRET || 'holywood';

module.exports = {
    sign(user) {
        const payload = {
            id: user._id,
            roles: user.roles
        };

        return jwt.sign(payload, APP_SECRET);
    },
    
    verify(token) {
        return jwt.verify(token, APP_SECRET);
    }
};