const { ObjectId } = require('mongoose').Types;

const filmAvg = (top) => {
    const steps = [
        lookup('studios','studio','_id','studio'),
        lookup('reviews','_id','film','rating'),
        unwind('rating'),
        filmByIdGroup
    ];

    if(!top) steps.push(sortByRelease);
    if(top) steps.push(sortByRating, limit);

    return steps;
};

const sortActor = () => {
    const steps = [
        lookup('films','_id','cast.actor','films'),
        unwind('films'),
        actorGroup
    ];

    return steps;
};

const sortReviewer = (id) => {

    const steps = [
        match(id),
        lookup('reviews', '_id','reviewer','reviews'),
        unwind('reviews'),
        reviewerGroup
    ];

    return steps;
};

const lookup = (from, local, foreign, as) => {
    return {
        $lookup: {
            from: `${from}`,
            localField: `${local}`,
            foreignField: `${foreign}`,
            as: `${as}`
        }
    };
};

const unwind = (path) => {
    return {
        $unwind: `$${path}`
    };
};

const match = (id) => {
    return { $match: { _id: ObjectId(id) }}; //eslint-disable-line
};

const filmByIdGroup = {
    $group: {
        _id: '$_id',
        title: {$first: '$title'},
        released: {$first: '$released'},
        studio: {$first: '$studio.name'},
        averageRating: { $avg: '$rating.rating' }
    },
};

const actorGroup = {
    $group: {
        _id: '$_id',
        name: {$first: '$name'},
        movieCount: { '$sum': 1 }
    },
};

const reviewerGroup = {
    $group: {
        _id : '$_id',
        name: {$first: '$name'},
        company: {$first: '$company'},
        countOfReviews: {'$sum': 1},
        averageReview: { $avg: '$reviews.rating' }
    }
};

const sortByRating = { '$sort': { 'averageRating' : -1 } };

const sortByRelease = { '$sort': { 'released' : -1 } };

const limit = { '$limit': 10 };

module.exports = {
    filmAvg, sortActor, sortReviewer
};