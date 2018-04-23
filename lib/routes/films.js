const router = require('express').Router(); /* eslint-disable-line */
const Film = require('../models/Film');

const check404 = (film, id) => {
    if(!film) {
        throw {
            status: 404,
            error: `Film id ${id} does not exist.`
        };
    }
};

module.exports = router
    .get('/', (req, res, next) => {
        Film.find(req.query)
            .lean()
            .populate({ path: 'films', select: '_id name' })
            .select('_id title released studio')
            .then(films => res.json(films))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Film.findById(id)
            .lean()
            .populate({ path: 'studio', select: '_id name'})
            .populate({path: 'cast', select: '_id part'})
            .populate({path: 'cast.actor', select: '_id name'})
            .populate({ path: 'reviews', select: '_id rating review'})
            // .populate({ path: 'reviewer', select: '_id name' })
            .then(film => {
                check404(film, id);
                res.json(film);
            })
            .catch(next);

    })

    .post('/', (req, res, next) => {
        Film.create(req.body)
            .then(film => res.json(film))
            .catch(next);
    })

    .delete('/:id', (req, res, next) => {
        Film.findByIdAndRemove(req.params.id)
            .then(removed => res.json({ removed }))
            .catch(next);
    });