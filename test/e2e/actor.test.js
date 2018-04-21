const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Actor = require('../../lib/models/Actor');

describe('Actor E2E API', () => {

    before (() => dropCollection('actors'));

    let felicia =  {
        name: 'Felicity Day',
        dob: new Date(1979, 6, 28),
        pob: 'Huntsville, AL'
    };

    let wilder = {
        name: 'Gene Wilder',
        dob: new Date(1933, 6, 11),
        pob: 'Milwaukee, MI'
    };

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    const getAllFields = ({ _id, name }) => {
        return {
            _id, name
        };
    };

    it('saves and gets an actor', () => {

        return request.post('/actors')
            .send(felicia)
            .then(checkOk)
            .then(({ body }) => {
                const { _id, __v, dob } = body;
                assert.ok( _id );
                assert.equal(__v, 0);
                assert.deepEqual(body, {
                    ...felicia,
                    _id, __v, dob
                });
                felicia = body;
            });
    });

    it('gets an actor by id', () => {

        return request.post('/actors')
            .send(wilder)
            .then(checkOk)
            .then(({ body }) => {
                wilder = body;
                return request.get(`/actors/${wilder._id}`);
            })
            .then(({ body }) => {
                const { dob } = body;
                assert.deepEqual(body, {
                    ...wilder,
                    dob
                });
            });
    });

    it('updates an actor', () => {
        wilder.pob = 'Milwaukee, WI';

        return request.put(`/actors/${wilder._id}`)
            .send(wilder)
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, wilder);
                return request.get(`/actors/${wilder._id}`);
            })
            .then(({ body }) => {
                assert.equal(body.role, wilder.role);
            });
    });

    it('gets all actors', () => {
        return request.get('/actors')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, [felicia, wilder].map(getAllFields));
            });
    });

    it('bye felicia', () => {
        return request.delete(`/actors/${felicia._id}`)
            .then(() => {
                return Actor.findById(felicia._id);
            })
            .then(found => {
                assert.isNull(found);
            });
    });

    it('returns 404 on non-existant id', () => {
        return request.get(`/actors/${felicia._id}`)
            .then(res => {
                assert.equal(res.status, 404);
                assert.match(res.body.error, new RegExp(felicia._id));
            });
    });
});