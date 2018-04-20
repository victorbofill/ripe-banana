const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe.only('Reviewer API', () => {

    before(() => dropCollection('reviewers'));

    let kael = {
        name: 'Pauline Kael',
        company: 'https://www.rottentomatoes.com/critic/pauline-kael/movies'
    };

    // const someone = {
    //     somthine
    // }
    
    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
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
    
});
