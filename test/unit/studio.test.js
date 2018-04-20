const { assert } = require('chai');
const { getErrors } = require('./helpers');
const Studio = require('../../lib/models/Studio');

describe('Studio model', () => {
    it('valid good model', () => {
        const data = {
            name: 'Universal',
            address: {
                city: 'Hollywood Land',
                state: 'CA',
                country: 'United States',
            }
        };

        const studio = new Studio(data);

        data._id = studio._id;
        assert.deepEqual(studio.toJSON(), data);
    });

    it('requires name', () => {
        const studio = new Studio({});
        const errors = getErrors(studio.validateSync());
        assert.equal(errors.name.kind, 'required');
    });

    it('state must be enumerated', () => {
        const studio = new Studio({name: 'Test', address: { state: 'SHOCK' }});
        const errors = getErrors(studio.validateSync());
        assert.equal(errors['address.state'].kind, 'enum');
    });

});