const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Review = require('../../lib/models/Review');

describe('Review E2E API', () => {

    const reviewer = {
        name: 'Pauline Kael',
        company: 'https://www.rottentomatoes.com/critic/pauline-kael/movies',
        email: 'me@me.com',
        password: 'abc123',
        role: 'admin'
    };

    let token = null;

    let film = {
        title: 'Jumanji'
    };

    let good = {
        rating: 5,
        review: 'decent',
    };

    let bad = {
        rating: 1,
    };

    before(() => dropCollection('reviews'));
    before(() => dropCollection('reviewers'));
    before(() => dropCollection('films'));

    before(() => {
        return request.post('/auth/signup')
            .send(reviewer)
            .then(({ body }) => {
                reviewer._id = body._id;
                token = body.token;
                assert.ok(reviewer._id);
                assert.ok(token);
                assert.ok(body.role);
                bad.reviewer = reviewer._id;
                good.reviewer = reviewer._id;
            
                return request.post(`/films`)
                    .set('Authorization', reviewer.role)
                    .send(film)
                    .then(({ body }) => {
                        film = body;
                        assert.ok(film._id);
                        bad.film = film._id;
                        good.film = film._id;
                    });
            });
    });

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    const getAllFields = ({ _id, film: { _id:filmId, title }, rating, review}) => {
        return {
            _id, film: { _id:filmId, title }, rating, review
        };
    };

    it('cannot post test without log in', () => {

        return request.post('/reviews')
            .send(good)
            .then(response => {
                assert.equal(response.status, 400);
                assert.equal(response.body.error, 'No token found');
            });
    });

    it('saves and gets a review, by logged in user', () => {

        return request.post('/reviews')
            .set('Authorization', token)
            .send(good)
            .then(checkOk)
            .then(({ body }) => {
                const { _id, __v, uploaded, rating } = body;
                assert.ok(_id);
                assert.equal(__v, 0);
                assert.deepEqual(body, {
                    ...good,
                    _id, __v, uploaded, rating
                });
                good = body;
            });
    });

    it('gets a review by id', () => {
        return request.post('/reviews')
            .set('Authorization', token)
            .send(bad)
            .then(checkOk)
            .then(({ body }) => {
                bad = body;
                return request.get(`/reviews/${bad._id}`);
            })
            .then(({ body }) => {
                assert.deepEqual(body, bad);
            });
    });

    it('updates a review, by logged in user', () => {
        bad.review = 'truly terrible';

        return request.put(`/reviews/${bad._id}`)
            .set('Authorization', token)
            .send(bad)
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, bad);
                return request.get(`/reviews/${bad._id}`);
            })
            .then(({ body }) => {
                assert.equal(body.review, bad.review);
            });
    });

    it('gets all reviews', () => {
        return request.get('/reviews')
            .then(checkOk)
            .then(({ body }) => {

                const { film:film1 } = body[0];
                const { film:film2 } = body[1];
                good.film = film1;
                bad.film = film2;

                assert.deepEqual(body, [good, bad].map(getAllFields));
            });
    });

    it('deletes a review', () => {
        return request.delete(`/reviews/${bad._id}`)
            .then(() => {
                return Review.findById(bad._id);
            })
            .then(found => {
                assert.isNull(found);
            });
    });

    it('returns 404 on get of non-existent id', () => {
        return request.get(`/reviews/${bad._id}`)
            .then(response => {
                assert.equal(response.status, 404);
                assert.match(response.body.error, new RegExp(bad._id));
            });
    });
});