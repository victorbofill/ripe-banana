const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Reviewer = require('../../lib/models/Reviewer');

describe.only('Reviewer API', () => {

    let kael = {
        name: 'Pauline Kael',
        company: 'https://www.rottentomatoes.com/critic/pauline-kael/movies'
    };
    
    let guy = {
        name: 'Some Guy',
        company: 'https://www.myopinionmatters.com'
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

    it('saves and gets a reviewer', () => {

        return request.post('/reviewers')
            .send(kael)
            .then(checkOk)
            .then(({ body }) => {
                const { _id, __v } = body;
                assert.ok(_id);
                assert.equal(__v, 0);
                assert.deepEqual(body, {
                    ...kael,
                    _id, __v
                });

                kael = body;
                assert.ok(kael._id);
            });
    });

    it('gets a reviewer by id, and reviews', () => {
        review.reviewer = kael._id;
        assert.equal(kael._id, review.reviewer);

        return request.post('/reviews')
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

    it('updates a reviewer', () => {
        
        return request.post('/reviewers')
            .send(guy)
            .then(({ body }) => {
                guy = body;
                guy.name = 'Mr. Some Guy';
                return request.put(`/reviewers/${guy._id}`)
                    .send(guy)
                    .then(checkOk)
                    .then(({ body }) => {
                        assert.deepEqual(body, guy);
                        return request.get(`/reviewers/${guy._id}`);
                    })
                    .then(({ body }) => {
                        assert.equal(body.name, guy.name);
                    });
            });
    });

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