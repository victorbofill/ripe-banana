const router = require('express').Router(); /* eslint-disable-line */
const Review = require('../models/Review');

const check404 = (review, id) => {
    if(!review) {
        throw {
            status: 404,
            error: `Review id ${id} does not exist.`
        };
    }
};

module.exports = router
    .get('/', (req, res, next) => {
        Review.find(req.query)
            .lean()
            .limit(100)
            .populate({ path: 'film', select: '_id title' })
            .select('_id rating review film')
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
    })

    .post('/', (req, res, next) => {
        Review.create(req.body)
            .then(review => res.json(review))
            .catch(next);
    })
    
    .put('/:id', (req, res, next) => {
        Review.findByIdAndUpdate(req.params.id, req.body, updateOptions)
            .then(updated => res.json(updated))
            .catch(next);
    })
    
    .delete('/:id', (req, res, next) => {
        Review.findByIdAndRemove(req.params.id)
            .then(removed => res.json({ removed }))
            .catch(next);
    });;