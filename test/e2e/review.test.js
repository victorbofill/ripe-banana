const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe.only('Review API', () => {

    before(() => dropCollection('reviews'));
    
    let reviewer = {
        name: 'Pauline Kael'
    };

    let film = {
        title: 'Jumanji'
    };

    let good = {
        rating: 5,
    };

    let bad = {
        rating: 1,
    };
    
    before(() => {
        return request.post('/reviewers')
            .send(reviewer)
            .then(({ body }) => {
                reviewer = body;
                assert.ok(reviewer._id);
                bad.reviewer = reviewer._id;
                good.reviewer = reviewer._id;
            
                return request.post(`/films`)
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

    const getAllFields = ({ _id, name }) => {
        return {
            _id, rating, review,
            film: { _id, name }
        };
    };

    it('saves a review', () => {

        return request.post('/reviews')
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

    // it('gets a reviewer by id', () => {

    //     return request.post('/reviewers')
    //         .send(guy)
    //         .then(checkOk)
    //         .then(({ body }) => {
    //             guy = body;
    //             return request.get(`/reviewers/${guy._id}`);
    //         })
    //         .then(({ body }) => {
    //             assert.deepEqual(body, guy);
    //         });
    // });

    // it('updates a reviewer', () => {
    //     guy.name = 'Mr. Some Guy';

    //     return request.put(`/reviewers/${guy._id}`)
    //         .send(guy)
    //         .then(checkOk)
    //         .then(({ body }) => {
    //             assert.deepEqual(body, guy);
    //             return request.get(`/reviewers/${guy._id}`);
    //         })
    //         .then(({ body }) => {
    //             assert.equal(body.name, guy.name)
    //         });
    // });

    // it('gets all reviewers', () => {
    //     return request.get('/reviewers')
    //         .then(checkOk)
    //         .then(({ body }) => {
    //             assert.deepEqual(body, [kael, guy].map(getAllFields));
    //         });

    // });

    // it('deletes a reviewer', () => {
    //     return request.delete(`/reviewers/${guy._id}`)
    //         .then(() => {
    //             return request.get(`/reviewers/${guy._id}`);
    //         })
    //         .then(res => {
    //             assert.equal(res.status, 404);
    //         });
    // });

    // it('returns 404 on get of non-existent id', () => {
    //     return request.get(`/reviewers/${guy._id}`)
    //         .then(response => {
    //             assert.equal(response.status, 404);
    //             assert.match(response.body.error, new RegExp(guy._id));
    //         });
    // });

});