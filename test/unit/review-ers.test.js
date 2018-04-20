const { assert } = require('chai');
const { Types } = require('mongoose');
const Review = require('../../lib/models/Review');
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

describe('Review model', () => {

    it('valid good model', () => {
        const uploaded = new Date();
        const rating = "5";
        const data = {
            rating: 5,
            reviewer: Types.ObjectId(),
            review: 'it is very good',
            film: Types.ObjectId(),
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
        const errors = getErrors(review.validateSync(), 1);
        assert.equal(errors.rating.kind, 'required');
    });

    it('review must be a tweet', () => {
        const review = new Review({
            review: 'it was very good but sometimes bad and i had to stop and think is it good or bad? and i thought about it and i decided it was good sometimes.'
        });
        const errors = getErrors(review.validateSync(), 2);
        assert.equal(errors.review.kind, 'maxlength');
    });
});