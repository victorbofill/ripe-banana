const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Film = require('../../lib/models/Film');

describe('Film E2E API', () => {

    let studio = {
        name: 'Universal Studios',
        address: {
            state: 'CA',
            country: 'United States'
        },
    };

    let actor =  {
        name: 'Felicia Day',
        dob: new Date(1979, 6, 28),
        pob: 'Huntsville, AL'
    };

    const reviewer = {
        name: 'Some Guy',
        company: 'https://www.myopinionmatters.com',
        email: 'thisguy@email.com',
        password: 'abc',
        role: 'admin'
    };

    const nonAdmin = {
        name: 'Bob',
        email: 'test@someone.com',
        password: 'secret',
        role: 'user'
    };

    let review = {
        rating: 5,
        review: 'It was ok',
        createdAt: new Date(),
        updateAt: this.createdAt
    };

    let lotr = {
        title: 'Lord of the Rings',
        released: 2008,
        cast: []
    };

    let trekWars = {
        title: 'Trek Wars',
        released: 2018,
        reviews: []
    };

    let token = null;

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    before(() => dropCollection('films'));
    before(() => dropCollection('actors'));
    before(() => dropCollection('studios'));
    before(() => dropCollection('reviews'));
    before(() => dropCollection('reviewers'));

    before(() => {
        return request.post('/auth/signup')
            .send(reviewer)
            .then(checkOk)
            .then(( { body }) => {
                reviewer._id = body._id;
                token = body.token;
                review.reviewer = reviewer._id;

                assert.ok(reviewer.role);
            });
    });

    before(() => {
        return request.post('/auth/signup')
            .send(nonAdmin)
            .then(checkOk)
            .then(( { body }) => {
                nonAdmin._id = body._id;
            });
    });

    before(() => {
        return request.post('/actors')
            .set('Authorization', reviewer.role)
            .send(actor)
            .then(checkOk)
            .then(({ body }) => actor = body)
            .then(() => {
                trekWars.cast = [{ part: 'dinosaur', actor: actor }];
            });
    });

    before(() => {
        return request.post('/studios')
            .set('Authorization', reviewer.role)
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
            .set('Authorization', reviewer.role)
            .send(trekWars)
            .then(checkOk)
            .then(( { body }) => trekWars = body)
            .then(() => {
                studio.films = [trekWars];
                review.film = trekWars;
            });
    });

    before(() => {
        return request.post('/reviews')
            .set('Authorization', token)
            .send(review)
            .then(checkOk)
            .then(( { body }) => review = body);
    });

    it('saves a film', () => {
        return request.post('/films')
            .set('Authorization', reviewer.role)
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

                const {_id, __v, title, released } = trekWars;
                assert.deepEqual(body, {_id, __v, title, released,
                    studio: {
                        _id: trekWars.studio,
                        name: studio.name
                    },
                    cast: [{
                        _id: trekWars.cast[0]._id,
                        actor: {
                            name: actor.name,
                            _id: actor._id
                        },
                        part: trekWars.cast[0].part
                    }],
                    reviews: [
                        { _id: review._id}
                    ]
                });
            });
    });

    const getAllFields = ({ _id, title, released, studio }) => ({ _id, title, released, studio });

    it('gets all films', () => {
        return request.get('/films')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, [trekWars, lotr].map(getAllFields));
            });
    }).timeout(2500);

    it('deletes a film', () => {
        return request.delete(`/films/${lotr._id}`)
            .set('Authorization', reviewer.role)
            .then(() => {
                return Film.findById(lotr._id);
            })
            .then(found => {
                assert.isNull(found);
            });
    });

    it('returns error if non-admin attempts to post', () => {
        return request.post('/films')
            .set('Authorization', nonAdmin.role)
            .then(({ res }) => {
                assert.equal(res.statusCode, 403);
            });
    });

    it('returns a 404 when film is not found', () => {
        return request.get(`/films/${lotr._id}`)
            .then(res => {
                assert.equal(res.status, 404);
            });
    });
});