const router = require('express').Router(); /* eslint-disable-line */
const Actor = require('../models/Actor');
const { updateOption } = require('../util/mongoose-helpers');

const check404 = (actor, id) => {
    if(!actor) {
        throw {
            status: 404,
            error: `Actor id ${id} does not exist.`
        };
    }
};

const getAllFields = ({ _id, name }) => ({ _id, name });

const getOneFields = ({_id, dob, pob, films: [{ _id:actorId, title, released }]}) => ({_id, dob, pob, films: [{ _id:actorId, title, released }]});

module.exports = router
    .get('/', (req, res, next) => {
        Actor.find(req.query)
            .lean()
            .select('name')
            .then(actors => res.json(actors))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Actor.findById(id)
            .lean()
            .then(actor => {
                check404(actor, id);
                res.json(actor);
            })
            .catch(next);

    });