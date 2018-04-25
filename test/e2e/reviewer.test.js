const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Reviewer = require('../../lib/models/Reviewer');

describe('Reviewer E2E API', () => {

    let kael = {
        name: 'Pauline Kael',
        company: 'https://www.rottentomatoes.com/critic/pauline-kael/movies',
        email: 'kael@email.com',
        password: 'abc',
        role: 'admin'
    };
    
    let guy = {
        name: 'Some Guy',
        company: 'https://www.myopinionmatters.com',
        email: 'thisguy@email.com',
        password: 'abc',
        role: 'user'
    };
    
    let film = {
        title: 'Jumanji'
    };

    let review = {
        rating: 3,
        review: 'kind of weird',
        film: {
            _id: null,
            title: null,
        }
    };
    
    let token = null;
    
    before(() => dropCollection('reviewers'));
    before(() => dropCollection('films'));
    before(() => {
        return request.post('/films')
            .send(film)
            .then(({ body }) => {
                film = body;
                assert.ok(film._id);
                review.film._id = film._id;
                review.film.title = film.title;

                return request
                    .post('/auth/signup')
                    .send(kael)
                    .then (({ body }) => {
                        kael._id = body._id;
                        token = body.token;
                        return request
                            .post('/auth/signup')
                            .send(guy)
                            .then (({ body }) => guy._id = body._id);
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

    it('gets a reviewer by id, and reviews', () => {
        review.reviewer = kael._id;
        assert.equal(kael._id, review.reviewer);

        return request.post('/reviews')
            .set('Authorization', token)
            .send(review)
            .then(({ body }) => {
                review = body;
                return request.get(`/reviewers/${kael._id}`);
            })
            .then(({ body }) => {
                const { _id, company, name } = kael;
                assert.deepEqual(body, {
                    _id, company, name,
                    reviews: [{
                        _id: review._id,
                        rating: review.rating,
                        review: review.review,
                        film: {
                            _id: film._id,
                            title: film.title
                        }
                    }]
                });
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