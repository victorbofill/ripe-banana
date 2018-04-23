const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Film = require('../../lib/models/Film');

describe.only('Film E2E Testing', () => {

    let studio = {
        name: 'Universal Studios',
        address: {
            state: 'CA',
            country: 'United States'
        },
        films: []
    };

    let actor =  {
        name: 'Felicia Day',
        dob: new Date(1979, 6, 28),
        pob: 'Huntsville, AL'
    };

    let lotr = {
        title: 'Lord of the Rings',
        released: 2008,
        cast: []
    };

    let trekWars = {
        title: 'Trek Wars',
        released: 2018,
    };

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    before(() => dropCollection('films'));
    before(() => dropCollection('actors'));
    before(() => dropCollection('studios'));

    before(() => {
        return request.post('/actors')
            .send(actor)
            .then(checkOk)
            .then(({ body }) => actor = body)
            .then(() => {
                trekWars.cast = [{ part: 'dinosaur', actor: actor }];
            });
    });

    before(() => {
        return request.post('/studios')
            .send(studio)
            .then(checkOk)
            .then(({ body }) => studio = body)
            .then(() => {
                trekWars.studio = studio;
                lotr.studio = studio._id;
            });
    });

    before(() => {
        return request.post('/films')
            .send(trekWars)
            .then(checkOk)
            .then(( { body }) => trekWars = body)
            .then(() => {
                studio.films = [trekWars];
            });
    });

    it('saves a film', () => {
        return request.post('/films')
            .send(lotr)
            .then(checkOk)
            .then(( {body }) => {
                const { _id, __v } = body;
                assert.ok(_id);
                assert.equal(__v, 0);
                assert.deepEqual(body, {
                    _id, __v,
                    ...lotr
                });
                lotr = body;
            });
    });

    it('gets a film by id', () => {
        return request.get(`/films/${trekWars._id}`)
            .send(trekWars)
            .then(checkOk)
            .then(( { body }) => {
                const {_id, __v, title, released, cast } = trekWars;
                assert.deepEqual(body, {_id, __v, title, released,
                    studio: {
                        _id: trekWars.studio,
                        name: 'Universal Studios'
                    },
                    cast });
            });
    });

    const getAllFields = ({ _id, title, released, studio }) => ({ _id, title, released, studio });

    it('gets all films', () => {
        return request.get('/films')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, [trekWars, lotr].map(getAllFields));
            });
    });

    it('deletes a film', () => {
        return request.delete(`/films/${lotr._id}`)
            .then(() => {
                return Film.findById(lotr._id);
            })
            .then(found => {
                assert.isNull(found);
            });
    });

    it('returns a 404 when film is not found', () => {
        return request.get(`/films/${lotr._id}`)
            .then(res => {
                assert.equal(res.status, 404);
            });
    });
});