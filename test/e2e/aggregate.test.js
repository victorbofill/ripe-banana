
const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Film = require('../../lib/models/Film');

describe.only('Aggregate tests API', () => {

    const reviewer = {
        name: 'Lady',
        email: 'me@me.com',
        password: 'abc',
        role: 'admin'
    };

    let universal = {
        name: 'Universal Cartoon Studios',
        address: {
            state: 'CA',
            country: 'United States'
        },
        films: []
    };

    let film1 = {
        title: 'Land Before Time',
        released: 1988 ,
    };

    let film2 = {
        title: 'Land Before Time 2: The Great Valley Adventure',
        released: 1994,
    };

    let film3 = {
        title: 'Land Before Time 3: The Time of Great Giving',
        released: 1995,
    };

    let review1 = {
        rating: 5,
        reviewer: null,
        film: null
    };

    let review2 = {
        rating: 3,
        reviewer: null,
        film: null
    };

    let review3 = {
        rating: 1,
        reviewer: null,
        film: null
    };
    
    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    let token = null;


    before(() => dropCollection('reviewers'));
    before(() => dropCollection('studios'));
    before(() => dropCollection('films'));

    before(() => {
        return request.post('/auth/signup')
            .send(reviewer)
            .then(checkOk)
            .then(( { body }) => {
                reviewer._id = body._id;
                token = body.token;
                review1.reviewer = reviewer._id;
                review2.reviewer = reviewer._id;
                review3.reviewer = reviewer._id;

                assert.ok(body.role);
                assert.ok(reviewer._id);
                assert.ok(token);
            });
    });

    before(() => {
        return request.post('/studios')
            .set('Authorization', reviewer.role)
            .send(universal)
            .then(checkOk)
            .then(({ body }) => {
                universal = body;
                
                assert.ok(universal._id);
                film1.studio = universal._id;
                film2.studio = universal._id;
                film3.studio = universal._id;
            });
    });

    before(() => {
        return request.post('/films')
            .set('Authorization', reviewer.role)
            .send(film1)
            .then(checkOk)
            .then(( { body }) => {
                film1 = body;
                review1.film = film1._id;
                universal.films.push({
                    _id: film1._id,
                    title: film1.title
                });
                return request.post('/films')
                    .set('Authorization', reviewer.role)
                    .send(film2)
                    .then(checkOk)
                    .then(( { body }) => {
                        film2 = body;
                        review2.film = film2._id;
                        universal.films.push({
                            _id: film2._id,
                            title: film2.title
                        });
                        return request.post('/films')
                            .set('Authorization', reviewer.role)
                            .send(film3)
                            .then(checkOk)
                            .then(( { body }) => {
                                film3 = body;
                                review3.film = film3._id;
                                universal.films.push({
                                    _id: film3._id,
                                    title: film3.title
                                });
                                assert.equal(universal.films.length, 3);
                            });
                    });
            });
    });

    before(() => {
        return request.post('/reviews')
            .set('Authorization', token)
            .send(review1)
            .then(checkOk)
            .then(( { body }) => {
                console.log('BODY' , body);
                review1 = body;
                return request.post('/reviews')
                    .set('Authorization', token)
                    .send(review2)
                    .then(checkOk)
                    .then(( { body }) => {
                        review2 = body;
                        return request.post('/reviews')
                            .set('Authorization', token)
                            .send(review3)
                            .then(checkOk)
                            .then(( { body }) => {
                                review3 = body;
                            });
                    });
            });
    });

    const getAllFields = ({ _id, title, released, studio, average }) => ({ _id, title, released, studio, average });

    it('gets all films with an average rating', () => {
        return request.get('/films')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, [film1, film2, film3].map(getAllFields));
                const expectedAvg = ( review1.rating + review2.rating + review3.rating ) / 3;
                assert.equal(body.averageRating, expectedAvg)
            });
    }).timeout(2500);

    it('gets top films sorted by highest', () => {
        return request.get('/films/top')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body[0], [film1].map(getAllFields));
                assert.deepEqual(body[2], [film3].map(getAllFields));
            });
    }).timeout(2500);


});
