const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe('Studio E2E Testing', () => {

    let universal = {
        name: 'Universal Studios',
        address: {
            state: 'CA',
            country: 'United States'
        }
    };

    let fox = {
        name: '21st Century Fox',
        address: {
            state: 'CA',
            country: 'United States'
        }
    };

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    before(() => dropCollection('actors'));
    before(() => dropCollection('studios'));
    before(() => {
        return request.post('/studios')
            .send(fox)
            .then(checkOk)
            .then(({ body }) => fox = body);
    });

    it('saves and gets a studio', () => {
        return request.post('/studios')
            .send(universal)
            .then(checkOk)
            .then(( {body }) => {
                const { _id, __v } = body;
                assert.ok(_id);
                assert.equal(__v, 0);
                assert.deepEqual(body, {
                    _id, __v,
                    ...universal
                });
                universal = body;
            });
    });

    // TODO: Add films to GET studio by id

    it('gets a studio by id', () => {
        return request.get(`/studios/${universal._id}`)
            .send(universal)
            .then(checkOk)
            .then(( { body }) => {
                const {_id, name, address } = universal;
                assert.deepEqual(body, {_id, name, address });
            });
    });

    const getAllFields = ({ _id, name }) => ({ _id, name });

    it('gets all studios', () => {
        return request.get('/studios')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, [fox, universal].map(getAllFields));
            });
    });
});