const { assert } = require('chai');
const Reviewer = require('../../lib/models/Reviewer');
const { getErrors } = require('./helpers');


describe('Reviewer model', () => {

    it('valid good model', () => {
        const data = {
            name: 'Pauline Kael',
            company: 'https://www.rottentomatoes.com/critic/pauline-kael/movies',
            email: 'me@me.com',
            hash: 'abc123',
            role: 'user'
        };

        const kael = new Reviewer(data);
        data._id = kael._id;
        assert.deepEqual(kael.toJSON(), data);
        assert.isUndefined(kael.validateSync());
    });

    it('required name, email, and user', () => {
        const reviewer = new Reviewer({});
        const errors = getErrors(reviewer.validateSync(), 3);
        assert.equal(errors.name.kind, 'required');
        assert.equal(errors.email.kind, 'required');
        assert.equal(errors.role.kind, 'required');
    });

    it('required valid email format', () => {
        const data = {
            name: 'Frank',
            email: 'Frank',
            role: 'user'
        };

        const reviewer = new Reviewer(data);
        const errors = getErrors(reviewer.validateSync(), 1);
        assert.equal(errors.email.kind, 'invalid email format');
    });

    it('user required enum', () => {
        const data = {
            name: 'Frank',
            email: 'me@me.com',
            role: 'Frank'
        };

        const reviewer = new Reviewer(data);
        const errors = getErrors(reviewer.validateSync(), 1);
        assert.equal(errors.role.kind, 'enum');
    });
});

