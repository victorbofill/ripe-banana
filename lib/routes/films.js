const router = require('express').Router(); /* eslint-disable-line */
const Film = require('../models/Film');
const { updateOption } = require('../util/mongoose-helpers');

const check404 = (film, id) => {
    if(!film) {
        throw {
            status: 404,
            error: `Film id ${id} does not exist.`
        };
    }
};

const getAllFields = ({ _id, title, released, studio: { _id:studioId, name } }) => ({ _id, title, released, studio: { _id:studioId, name } });

const getOneFields = ({title, released,
    studio: { _id, name },
    cast: [{ _id:castId, role,
        actor: {_id:actorId, name:actorName }}],
    reviews: [{ _id:reviewId, rating,
        reviewer: {_id:reviewerId, name:reviewerName }
    }]
}) =>
    ({title, released,
        studio: { _id, name },
        cast: [{ _id:castId, role,
            actor: {_id:actorId, name:actorName }}],
        reviews: [{ _id:reviewId, rating,
            reviewer: {_id:reviewerId, name:reviewerName }
        }]
    });

module.exports = router
    .get('/', (req, res, next) => {
        Film.find(req.query)
            .lean()
            .select('name')
            .then(films => res.json(films))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Film.findById(id)
            .lean()
            .then(film => {
                check404(film, id);
                res.json(film);
            })
            .catch(next);

    });