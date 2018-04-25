const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe.only('Auth API', () => {

    beforeEach(() => dropCollection('reviewers'));

    let token = null;

    beforeEach(() => {
        return request
            .post('/auth/signup')
            .send({
                name: 'Frank',
                email: 'me@me.com',
                password: 'abc',
                role: 'user'
            })
            .then (({ body }) => token = body.token);
    });

    it('signup', () => {
        assert.ok(token);
    });

    it('verifies', () => {
        return request
            .get('/auth/verify')
            .set('Authorization', token)
            .then(({ body }) => {
                assert.isOk(body.verified);
            });
    });

    it('signin', () => {
        return request
            .post('/auth/signin')
            .send({
                email: 'me@me.com',
                password: 'abc'
            })
            .then( ({ body }) => {
                assert.ok(body.token);
            });
    });

    it('gives 400 on signup with existing email', () => {
        return request
            .post('/auth/signup')
            .send({
                email: 'me@me.com',
                password: 'abc'
            })
            .then( res => {
                assert.equal(res.status, 400);
                assert.equal(res.body.error, 'Email exists');
            });
    });

    it('Gives 401 on non-existent email', () => {
        return request
            .post('/auth/signin')
            .send({
                email: 'bad@me.com',
                password: 'abc'
            })
            .then(res => {
                assert.equal(res.status, 401);
                assert.equal(res.body.error, 'Invalid email or password');
            });
    });

    it('Gives 401 on bad password', () => {
        return request
            .post('/auth/signin')
            .send({
                email: 'me@me.com',
                password: 'bad'
            })
            .then(res => {
                assert.equal(res.status, 401);
                assert.equal(res.body.error, 'Invalid email or password');
            });
    });
});
