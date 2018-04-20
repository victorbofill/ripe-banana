const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe('Reviewer API', () => {

    before(() => dropCollection('reviewers'));

    let kael = {
        name: 'Pauline Kael',
        company: 'https://www.rottentomatoes.com/critic/pauline-kael/movies'
    };

    let guy = {
        name: 'Some Guy',
        company: 'https://www.myopinionmatters.com'
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

    it('saves a reviewer', () => {

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
            });
    });

    it('gets a reviewer by id', () => {

        return request.post('/reviewers')
            .send(guy)
            .then(checkOk)
            .then(({ body }) => {
                guy = body;
                return request.get(`/reviewers/${guy._id}`);
            })
            .then(({ body }) => {
                assert.deepEqual(body, guy);
            });
    });

    it('updates a reviewer', () => {
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
                return request.get(`/reviewers/${guy._id}`);
            })
            .then(res => {
                assert.equal(res.status, 404);
            });
    });

    it('returns 404 on get of non-existent id', () => {
        return request.get(`/reviewers/${guy._id}`)
            .then(response => {
                assert.equal(response.status, 404);
                assert.match(response.body.error, new RegExp(guy._id));
            });
    });

});