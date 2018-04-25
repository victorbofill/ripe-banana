const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Actor = require('../../lib/models/Actor');

describe('Actor E2E API', () => {

    const reviewer = {
        name: 'Lady',
        email: 'me@me.com',
        password: 'abc',
        role: 'admin'
    };

    const nonAdmin = {
        name: 'Bob',
        email: 'test@someone.com',
        password: 'secret',
        role: 'user'
    };

    before (() => dropCollection('actors'));
    before(() => dropCollection('reviewers'));

    before(() => {
        return request.post('/auth/signup')
            .send(reviewer)
            .then(checkOk)
            .then(( { body }) => {
                reviewer._id = body._id;

                assert.ok(body.role);
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

    let felicia =  {
        name: 'Felicia Day',
        dob: new Date(1979, 6, 28),
        pob: 'Huntsville, AL',
    };

    let wilder = {
        name: 'Gene Wilder',
        dob: new Date(1933, 6, 11),
        pob: 'Milwaukee, MI',
    };

    let film = {
        title: `Dr.Horrible's Sing Along Blog'`,
        released: 2008,
        cast: []
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
            .set('Authorization', reviewer.role)
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

    it('gets an actor by id, with films', () => {
        const cast = { role : 'Penny', actor: felicia._id };
        film.cast.push(cast);
        assert.equal(felicia._id, film.cast[0].actor);

        return request.post('/films')
            .set('Authorization', reviewer.role)
            .send(film)
            .then(({ body }) => {
                film = body;
                return request.get(`/actors/${felicia._id}`);
            })
            .then(({ body }) => {
                const { _id, name, dob, pob } = felicia;
                assert.deepEqual(body, {
                    _id, name, dob, pob,
                    films: [{
                        _id: film._id,
                        title: film.title,
                        released: film.released
                    }]
                });
            });

    });

    it('updates an actor', () => {
        return request.post('/actors')
            .set('Authorization', reviewer.role)
            .send(wilder)
            .then(({ body }) => {
                wilder = body;
                wilder.pob = 'Milwaukee, WI';
                return request.put(`/actors/${wilder._id}`)
                    .set('Authorization', reviewer.role)
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
    });

    it('gets all actors', () => {
        return request.get('/actors')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, [felicia, wilder].map(getAllFields));
            });
    });

    it('deletes an actor', () => {
        return request.delete(`/actors/${wilder._id}`)
            .set('Authorization', reviewer.role)
            .then(() => {
                return Actor.findById(wilder._id);
            })
            .then(found => {
                assert.isNull(found);
            });
    });

    it('cannot delete an actor who is in a film', () => {
        return request.delete(`/actors/${felicia._id}`)
            .set('Authorization', reviewer.role)
            .then(() => {
                return Actor.findById(felicia._id);
            })
            .then(found => {
                assert.ok(found);
            });
    });

    it('returns error if non-admin attempts to post', () => {
        return request.post('/actors')
            .set('Authorization', nonAdmin.role)
            .then(({ res }) => {
                assert.equal(res.statusCode, 403);
            });
    });

    it('returns 404 on non-existant id', () => {
        return request.get(`/actors/${wilder._id}`)
            .then(res => {
                assert.equal(res.status, 404);
            });
    });
});