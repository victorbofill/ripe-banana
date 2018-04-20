const router = require('express').Router(); /* eslint-disable-line */
const Reviewer = require('../models/Reviewer');
const { updateOption } = require('../util/mongoose-helpers');

const check404 = (reviewer, id) => {
    if(!reviewer) {
        throw {
            status: 404,
            error: `Reviewer id ${id} does not exist.`
        };
    }
};

const getAllFields = ({ _id, name, company }) => ({ _id, name, company });

const getOneFields = ({_id, name, company, reviews: [{ _id:reviewId, rating, review, film: { _id:filmId, fName } }]}) =>
    ({_id, name, company, reviews: [{ _id:reviewId, rating, review, film: { _id:filmId, fName } }]});

module.exports = router
    .get('/', (req, res, next) => {
        Reviewer.find(req.query)
            .lean()
            .select('name')
            .then(reviewers => res.json(reviewers))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Reviewer.findById(id)
            .lean()
            .then(reviewer => {
                check404(reviewer, id);
                res.json(reviewer);
            })
            .catch(next);

    });