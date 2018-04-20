const router = require('express').Router(); /* eslint-disable-line */
const Studio = require('../models/Studio');
const { updateOption } = require('../util/mongoose-helpers');

const check404 = (studio, id) => {
    if(!studio) {
        throw {
            status: 404,
            error: `Studio id ${id} does not exist.`
        };
    }
};

const getAllFields = ({ _id, name}) => ({ _id, name});

const getOneFields = ({_id, name, address, films: [{_id:filmId, title }]}) =>
    ({_id, name, address, films: [{_id:filmId, title }]});

module.exports = router
    .get('/', (req, res, next) => {
        Studio.find(req.query)
            .lean()
            .select('name')
            .then(studios => res.json(studios))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Studio.findById(id)
            .lean()
            .then(studio => {
                check404(studio, id);
                res.json(studio);
            })
            .catch(next);

    });

// .post('/', (req, res, next) => {
// });

// .delete('/:id', (req, res, next) => {
// cannot delete unless NO FILMS
// });