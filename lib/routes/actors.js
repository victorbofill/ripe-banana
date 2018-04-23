const router = require('express').Router(); /* eslint-disable-line */
const Actor = require('../models/Actor');
const Film = require('../models/Film');
const { updateOptions } = require('../util/mongoose-helpers');

const check404 = (actor, id) => {
    if(!actor) {
        throw {
            status: 404,
            error: `Actor id ${id} does not exist.`
        };
    }
};

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

        Promise.all([
            Actor.findById(id)
                .lean()
                .select('name dob pob'),

            Film.find({ cast: { $elemMatch: { actor: id } } })
                .lean()
                .select('_id title released')
        ])
            .then(([actor, films]) => {
                check404(actor, films);
                actor.films = films;
                res.json(actor);
            })
            .catch(next);

    })

    .post('/', (req, res, next) => {
        Actor.create(req.body)
            .then(actor => res.json(actor))
            .catch(next);
    })

    .put('/:id', (req, res, next) => {
        Actor.findByIdAndUpdate(req.params.id, req.body, updateOptions)
            .then(actor => res.json(actor))
            .catch(next);
    })

    .delete('/:id', (req, res, next) => {
        const { id } = req.params;

        Film.find({ cast: { $elemMatch: { actor: id } } })
            .then(films => {
                if(!films[0]){
                    Actor.findByIdAndRemove(id)
                        .then(removed => res.json({ removed }));
                } else {
                    console.log('Films found! Cannot delete.');
                    res.json(req);
                }
            })
            .catch(next);
    });