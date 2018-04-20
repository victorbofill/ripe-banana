const { assert } = require('chai');
const { Types } = require('mongoose');
const Actor = require('../../lib/models/Actor');
const { getErrors } = require('./helpers');


describe('Actor model', () => {

    it('valid good model', () => {
        const data = {
            name: 'Felicity Day',
            dob: new Date(1979, 6, 28),
            pob: 'Huntsville, AL'
        };

        const actor = new Actor(data);
        data._id = actor._id;
        assert.deepEqual(actor.toJSON(), data);
        assert.isUndefined(actor.validateSync());
    });

    it('required name', () => {
        const actor = new Actor({});
        const errors = getErrors(actor.validateSync(), 1);
        assert.equal(errors.name.kind, 'required');
    });
});