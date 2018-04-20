const { assert } = require('chai');
const { Types } = require('mongoose');
const Film = require('../../lib/models/Film');
const { getErrors } = require('./helpers');

describe('Film model', () => {
    it('valid and good model', () => {
        const data = {
            title: 'Land Before Time 5',
            studio: Types.ObjectId(), /* eslint-disable-line */
            released: 2027,
            cast: [{
                part: 'dinosaur',
                actor: Types.ObjectId() /* eslint-disable-line */
            }]
        };

        const film = new Film(data);
        data._id = film._id;
        data.cast[0]._id = film.cast[0]._id;

        assert.deepEqual(film.toJSON(), data);
    });

    it('required name', () => {
        const film = new Film({});
        const errors = getErrors(film.validateSync(), 1);

        assert.equal(errors.title.kind, 'required');
    });

    it('released max of 4 and part max length 30', () => {
        const film = new Film({ title: 'Test', released: 99999, cast: [{part: `How many letters is this? I think it's more than 30.`}] });
        const errors = getErrors(film.validateSync(), 2);

        assert.equal(errors.released.kind, 'max');
        assert.equal(errors['cast.0.part'].kind, 'maxlength');
    });
});