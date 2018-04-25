const { assert } = require('chai');
const Reviewer = require('../../lib/models/Reviewer');
const { getErrors } = require('./helpers');


describe('Reviewer model', () => {

    it('valid good model', () => {
        const data = {
            name: 'Pauline Kael',
            company: 'https://www.rottentomatoes.com/critic/pauline-kael/movies',
            email: 'me@me.com',
            hash: 'abc123'
        };

        const kael = new Reviewer(data);
        data._id = kael._id;
        assert.deepEqual(kael.toJSON(), data);
        assert.isUndefined(kael.validateSync());
    });

    it('required name, and email', () => {
        const reviewer = new Reviewer({});
        const errors = getErrors(reviewer.validateSync(), 2);
        assert.equal(errors.name.kind, 'required');
    });

    it('required valid email format', () => {
        const data = {
            name: 'Frank',
            email: 'Frank'
        };

        const reviewer = new Reviewer(data);
        const errors = getErrors(reviewer.validateSync(), 1);
        assert.equal(errors.email.kind, 'invalid email format');
    });
});

