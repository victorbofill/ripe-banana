const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe('Actor E2E API', () => {


    before (() => dropCollection('bananas'));

    let felicia =  {
        name: 'Felicity Day',
        dob: new Date(1979, 6, 28),
        pob: 'Huntsville, AL'
    };

    let wilder = {
        name: 'Gene Wilder',
        dob: new Date(1933, 6, 11),
        pob: 'Miluakee, WI'
    };

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    it('saves and gets an actor', () => {

        return request.post('/actors')
            .send(felicia)
            .then(checkOk)
            .then(({ body }) => {
                const { _id, __v, dob} = body;
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
                return request.get(`/actors/${wilder._id}`)
            })
            .then(({ body }) => {
                const { dob } = body;
                assert.deepEqual(body, {
                    ...wilder,
                    dob
                });
            });
    });

});