const router = require('express').Router(); /* eslint-disable-line */
const Reviewer = require('../models/Reviewer');

const check404 = (reviewer, id) => {
    if(!reviewer) {
        throw {
            status: 404,
            error: `Reviewer id ${id} does not exist.`
        };
    }
};

module.exports = router
    .get('/', (req, res, next) => {
        Reviewer.find(req.query)
            .lean()
            .select('_id name company')
            .then(reviewers => res.json(reviewers))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;
        Reviewer.findReviewer(id)
            .then(([reviewer, reviews]) => {
                check404(reviewer, reviews);
                reviewer.reviews = reviews;
                res.json(reviewer);
            })
            .catch(next);
    })

    .delete('/:id', (req, res, next) => {
        Reviewer.findByIdAndRemove(req.params.id)
            .then(removed => res.json({ removed }))
            .catch(next);
    });
