const { assert } = require('chai');
const { Types } = require('mongoose');
const Review = require('../../lib/models/Review');
const { getErrors } = require('./helpers');

describe('Review model', () => {

    it('valid good model', () => {
        const uploaded = new Date();
        const rating = '5';
        const data = {
            rating: 5,
            reviewer: Types.ObjectId(), /* eslint-disable-line */
            review: 'it is very good',
            film: Types.ObjectId(), /* eslint-disable-line */
            uploaded: uploaded
        };


        const review = new Review(data);
        data._id = review._id;
        assert.deepEqual(review.toJSON(), {
            ...data,
            rating, uploaded
        });
        assert.isUndefined(review.validateSync());
    });

    it('required rating', () => {
        const review = new Review({});
        const errors = getErrors(review.validateSync(), 3);
        assert.equal(errors.rating.kind, 'required');
        assert.equal(errors.film.kind, 'required');
        assert.equal(errors.reviewer.kind, 'required');
    });

    it('review must be a tweet', () => {
        const review = new Review({
            review: 'it was very good but sometimes bad and i had to stop and think is it good or bad? and i thought about it and i decided it was good sometimes.'
        });
        const errors = getErrors(review.validateSync(), 4);
        assert.equal(errors.review.kind, 'maxlength');
    });
});