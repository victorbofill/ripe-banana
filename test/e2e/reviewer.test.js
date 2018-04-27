const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Reviewer = require('../../lib/models/Reviewer');

describe('Reviewer E2E API', () => {

    const kael = {
        name: 'Pauline Kael',
        company: 'https://www.rottentomatoes.com/critic/pauline-kael/movies',
        email: 'kael@email.com',
        password: 'abc',
        role: 'admin'
    };
    
    const guy = {
        name: 'Some Guy',
        company: 'https://www.myopinionmatters.com',
        email: 'thisguy@email.com',
        password: 'abc',
        role: 'user'
    };
    
    let film = {
        title: 'Jumanji'
    };
        
    before(() => dropCollection('reviewers'));
    before(() => dropCollection('films'));
    before(() => {
        return request
            .post('/auth/signup')
            .send(kael)
            .then (({ body }) => {
                kael._id = body._id;
                assert.ok(body.role);

                return request
                    .post('/auth/signup')
                    .send(guy)
                    .then (({ body }) => {
                        guy._id = body._id;

                        return request.post('/films')
                            .set('Authorization', kael.role)
                            .send(film)
                            .then(({ body }) => {
                                film = body;
                                assert.ok(film._id);
                            });
                    });
            });
    });
    
    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    const getAllFields = ({ _id, name, company }) => {
        return {
            _id, name, company
        };
    };

    it('gets all reviewers', () => {
        return request.get('/reviewers')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, [kael, guy].map(getAllFields));
            });

    });

    it('deletes a reviewer', () => {
        return request.delete(`/reviewers/${guy._id}`)
            .then(() => {
                return Reviewer.findById(guy._id);
            })
            .then(found => {
                assert.isNull(found);
            });
    });

    it('returns 404 on get of non-existent id', () => {
        return request.get(`/reviewers/${guy._id}`)
            .then(response => {
                assert.equal(response.status, 404);
            });
    });

});