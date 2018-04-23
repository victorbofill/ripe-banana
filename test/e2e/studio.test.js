const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Studio = require('../../lib/models/Studio');

describe('Studio E2E Testing', () => {

    let universal = {
        name: 'Universal Studios',
        address: {
            state: 'CA',
            country: 'United States'
        },
        films: []
    };

    let fox = {
        name: '21st Century Fox',
        address: {
            state: 'CA',
            country: 'United States'
        }
    };

    let actor =  {
        name: 'Felicia Day',
        dob: new Date(1979, 6, 28),
        pob: 'Huntsville, AL'
    };

    let film = {
        title: 'Land Before Time 5',
        released: 2027,
    };

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    before(() => dropCollection('actors'));
    before(() => dropCollection('studios'));
    before(() => dropCollection('films'));

    before(() => {
        return request.post('/actors')
            .send(actor)
            .then(checkOk)
            .then(({ body }) => actor = body)
            .then(() => {
                film.cast = [{ part: 'dinosaur', actor: actor }];
            });
    });

    before(() => {
        return request.post('/films')
            .send(film)
            .then(checkOk)
            .then(( { body }) => film = body)
            .then(() => {
                fox.films = [film];
            });
    });

    before(() => {
        return request.post('/studios')
            .send(fox)
            .then(checkOk)
            .then(({ body }) => fox = body)
            .then(() => {
                film.studio = fox;
            });
    });

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
                universal = body;
            });
    });

    it('gets a studio by id', () => {
        return request.get(`/studios/${fox._id}`)
            .send(fox)
            .then(checkOk)
            .then(( { body }) => {
                const {_id, name, address } = fox;
                assert.deepEqual(body,
                    {_id, name, address, films: [{
                        _id: fox.films[0],
                        title: 'Land Before Time 5'
                    }]
                    });
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

    it('deletes a studio', () => {
        return request.delete(`/studios/${universal._id}`)
            .then(() => {
                return Studio.findById(universal._id);
            })
            .then(found => {
                assert.isNull(found);
            });
    });

    it('denies deletion of studio if it contains films', () => {
        return request.delete(`/studios/${fox._id}`)
            .then(() => {
                return Studio.findById(fox._id);
            })
            .then(found => {
                assert.ok(found);
            });
    });

    it('returns a 404 when studio is not found', () => {
        return request.get(`/studios/${universal._id}`)
            .then(res => {
                assert.equal(res.status, 404);
            });
    });
});