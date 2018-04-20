const { assert } = require('chai');
const Reviewer = require('../../lib/models/Reviewer');
const { getErrors } = require('./helpers');


describe('Reviewer model', () => {

    it('valid good model', () => {
        const data = {
            name: 'Pauline Kael',
            company: 'https://www.rottentomatoes.com/critic/pauline-kael/movies'
        };

        const kael = new Reviewer(data);
        data._id = kael._id;
        assert.deepEqual(kael.toJSON(), data);
        assert.isUndefined(kael.validateSync());
    });

    it('required name', () => {
        const actor = new Reviewer({});
        const errors = getErrors(actor.validateSync(), 1);
        assert.equal(errors.name.kind, 'required');
    });
});

