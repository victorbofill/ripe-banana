
const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe('Aggregate tests API', () => {

    const reviewer = {
        name: 'Lady',
        company: 'Movie Deli',
        email: 'me@me.com',
        password: 'abc',
        role: 'admin'
    };

    const reviewer2 = {
        name: 'Some guy',
        email: 'me2@me.com',
        password: 'abc',
        role: 'user'
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
        released: 1988,
        cast: [],
    };

    let film2 = {
        title: 'Land Before Time 2: The Great Valley Adventure',
        released: 1994,
        cast: [],
    };

    let film3 = {
        title: 'Land Before Time 3: The Time of Great Giving',
        released: 1995,
        cast: [],
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

    let review4 = {
        rating: 4.5,
        reviewer: null,
        film: null
    };

    let review5 = {
        rating: 5,
        reviewer: null,
        film: null
    };

    let review6 = {
        rating: 1,
        reviewer: null,
        film: null
    };

    let actor = {
        name: 'Candace Hutson',
    };
    
    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    let token = null;


    before(() => dropCollection('reviewers'));
    before(() => dropCollection('studios'));
    before(() => dropCollection('films'));
    before(() => dropCollection('actors'));

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

                return request.post('/auth/signup')
                    .send(reviewer2)
                    .then(checkOk)
                    .then(( { body }) => {
                        reviewer2._id = body._id;
                        review4.reviewer = reviewer2._id;
                        review5.reviewer = reviewer2._id;
                        review6.reviewer = reviewer._id;

                        assert.ok(reviewer2._id);
                    });
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
        return request.post('/actors')
            .set('Authorization', reviewer.role)
            .send(actor)
            .then(checkOk)
            .then(({ body }) => {
                actor = body;
                const cast = {
                    part: 'Cera',
                    actor: actor._id,
                };
                film1.cast.push(cast);
                film2.cast.push(cast);
                film3.cast.push(cast);
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
                review4.film = film1._id;
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
                        review5.film = film2._id;
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
                                review6.film = film3._id;
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
                                return request.post('/reviews')
                                    .set('Authorization', token)
                                    .send(review4)
                                    .then(checkOk)
                                    .then(( { body }) => {
                                        review4 = body;
                                        return request.post('/reviews')
                                            .set('Authorization', token)
                                            .send(review5)
                                            .then(checkOk)
                                            .then(( { body }) => {
                                                review5 = body;
                                                return request.post('/reviews')
                                                    .set('Authorization', token)
                                                    .send(review6)
                                                    .then(checkOk)
                                                    .then(( { body }) => {
                                                        review6 = body;
                                                    });
                                            });
                                    });
                            });
                    });
            });
    });

    it('gets all films with an average rating, sort by release', () => {
        return request.get('/films')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body[0], {
                    _id: film3._id,
                    title: film3.title,
                    averageRating: (review3.rating + review6.rating) / 2,
                    released: film3.released,
                    studio: [ universal.name ]
                });
            });
    }).timeout(2500);

    it('gets top films sorted by highest rating', () => {
        return request.get('/films/top')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body[0], {
                    _id: film1._id,
                    title: film1.title,
                    averageRating: (review1.rating + review4.rating) / 2,
                    released: film1.released,
                    studio: [ universal.name ]
                });
                assert.isAtMost(body.length, 10);
            });
    }).timeout(2500);

    it('get actors includes movie count', () => {
        return request.get('/actors')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body[0], {
                    _id: actor._id,
                    name: actor.name,
                    movieCount: 3
                });
            });
    });

    it('get reviewer includes review count and average', () => {
        return request.get(`/reviewers/${reviewer._id}`)
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, {
                    _id: reviewer._id,
                    name: reviewer.name,
                    company: reviewer.company,
                    countOfReviews: 4,
                    averageReview: 2.5
                });
            });
    });


});
