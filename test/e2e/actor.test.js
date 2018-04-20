const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe('Actor E2E API', () => {


    // before (() => dropCollection('banannas'));

    let felicia =  {
        name: 'Felicity Day',
        dob: new Date(1979, 6, 28),
        pob: 'Huntsville, AL'
    };

    // let someone = {
    //     stuff
    // };

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    it('saves and gets an actor', () => {

        return request.post('/actors')
            .send(felicia)
            .then(checkOk)
            .then(({ body }) => {
                const { _id, __v } = body;
                assert.ok( _id );
                assert.equal(__v, 0);
                assert.deepEqual(body, {
                    _id, __v,
                    ...felicia
                });
                felicia = body;
            });
    });

});