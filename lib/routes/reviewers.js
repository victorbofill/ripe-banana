const router = require('express').Router(); /* eslint-disable-line */
const Reviewer = require('../models/Reviewer');
const { updateOptions } = require('../util/mongoose-helpers');

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

    })

    .post('/', (req, res, next) => {
        Reviewer.create(req.body)
            .then(reviewer => res.json(reviewer))
            .catch(next);
    })

    .put('/:id', (req, res, next) => {
        Reviewer.findByIdAndUpdate(req.params.id, req.body, updateOptions)
            .then(reviewer => res.json(reviewer))
            .catch(next);
    })

    .delete('/:id', (req, res, next) => {
        Reviewer.findByIdAndRemove(req.params.id)
            .then(removed => res.json({ removed }))
            .catch(next);
    });
