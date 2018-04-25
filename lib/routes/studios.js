const router = require('express').Router(); /* eslint-disable-line */
const Studio = require('../models/Studio');
const ensureRole = require('../util/ensure-role');

const check404 = (studio, id) => {
    if(!studio) {
        throw {
            status: 404,
            error: `Studio id ${id} does not exist.`
        };
    }
};

module.exports = router
    .post('/', ensureRole('admin'), (req, res, next) => {
        Studio.create(req.body)
            .then(studio => res.json(studio))
            .catch(next);
    })

    .get('/', (req, res, next) => {
        Studio.find(req.query)
            .lean()
            .select('_id name')
            .then(studios => res.json(studios))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Studio.findById(id)
            .lean()
            .populate({ path: 'films', select: '_id title' })
            .select('_id name address films')
            .then(studio => {
                check404(studio, id);
                res.json(studio);
            })
            .catch(next);

    })

    .delete ('/:id', ensureRole('admin'), (req, res, next) => {
        const { id } = req.params;

        Studio.findById(id)
            .lean()
            .then(studio => {
                if(!studio.films[0]){
                    Studio.findByIdAndRemove(id)
                        .then(removed => res.json({ removed }));
                } else {
                    console.log('Films found! Cannot delete.');
                    res.json(studio);
                }
            })
            .catch(next);
    });