const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Studio = require('../../lib/models/Studio');

describe('Studio E2E Testing', () => {
    before(() => dropCollection('actors'));
    before(() => dropCollection('studios'));

    let universal = {
        name: 'Universal Studios',
        state: 'CA',
        country: 'United States'
    };

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    it('saves a studio', () => {
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
            });
    });
});