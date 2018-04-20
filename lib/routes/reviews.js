const router = require('express').Router(); /* eslint-disable-line */
const Review = require('../models/Review');
const { updateOption } = require('../util/mongoose-helpers');

const check404 = (review, id) => {
    if(!review) {
        throw {
            status: 404,
            error: `Review id ${id} does not exist.`
        };
    }
};

const getFields = ({ _id, rating, review, film: { _id:filmId, name } }) => ({ _id, rating, review, film: { _id:filmId, name } });

module.exports = router
    .get('/', (req, res, next) => {
        Review.find(req.query)
            .lean()
            .select('name')
            .then(reviews => res.json(reviews))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Review.findById(id)
            .lean()
            .then(review => {
                check404(review, id);
                res.json(review);
            })
            .catch(next);

    });