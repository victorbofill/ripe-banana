const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const Types = require('mongoose');

describe.only('Review API', () => {

    let studio = {
        name: '21st Century Fox',
        address: {
            state: 'CA',
            country: 'United States'
        }
    };

    let reviewer = {
        name: 'Some Guy',
        company: 'https://www.myopinionmatters.com'
    };

    let actor =  {
        name: 'Felicity Day',
        dob: new Date(1979, 6, 28),
        pob: 'Huntsville, AL'
    };

    // let film = {
    //     title: 'Land Before Time 5',
    //     studio: Types.ObjectId(), /* eslint-disable-line */
    //     released: 2027,
    //     cast: [{
    //         part: 'dinosaur',
    //         actor: Types.ObjectId() /* eslint-disable-line */
    //     }]
    // };

    before(() => dropCollection('reviews'));
    before(() => dropCollection('reviewers'));
    before(() => dropCollection('actors'));
    before(() => dropCollection('studios'));
    before(() => dropCollection('films'));

    before(() => {
        return request.post('/studios')
            .send(studio)
            .then(checkOk)
            .then(({ body }) => studio = body);
    });

    before(() => {
        return request.post('/reviewers')
            .send(reviewer)
            .then(checkOk)
            .then(({ body }) => reviewer = body);
    });

    before(() => {
        return request.post('/actors')
            .send(actor)
            .then(checkOk)
            .then(({ body }) => actor = body);
    });

    // before(() => {
    //     return request.post('/films')
    //         .send(film)
    //         .then(checkOk)
    //         .then(({ body }) => film = body);
    // });

    let review = {
        rating: '5',
        reviewer: {
            name: 'Some Guy',
            company: 'https://www.myopinionmatters.com'
        },
        film: {
            title: 'Land Before Time 5',
            studio: {
                name: 'Universal'
            },
            released: 2027,
            cast: [{
                part: 'dinosaur',
                actor: {
                    name: 'Little Foot'
                }
            }]
        }
    };

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    // it('saves and gets a review', () => {
    //     return request.post('/reviews')
    //         .send(review)
    //         .then(checkOk)
    //         .then(( {body }) => {
    //             const { _id, __v } = body;
    //             assert.ok(_id);
    //             assert.equal(__v, 0);
    //             assert.deepEqual(body, {
    //                 _id, __v,
    //                 ...review
    //             });
    //             review = body;
    //         });
    // });

    // it('gets a review by id', () => {
    // });

    const getAllFields = ({ _id, name }) => {
        return {
            _id, rating, review,
            film: { _id, name }
        };
    };

    // it('gets all reviews', () => {
    // });

    // it('deletes a review', () => {
    // });

    // it('returns a 404 when review is not found', () => {
    // });
});