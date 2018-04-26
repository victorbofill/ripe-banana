//TO DO: add aggregations

const filmAvg = (top) => {
    const steps = [
        lookupStudios,
        lookupReviews,
        unwindRating,
        filmByIdGroup
    ];

    if(top) steps.push(sortByRating, limit);

    return steps;
};


const lookupStudios = {
    $lookup: {
        from: 'studios',
        localField: 'studio',
        foreignField: '_id',
        as: 'studio'
    }
};

const lookupReviews = {
    $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'film',
        as: 'rating'
    }
};

const unwindRating = {
    $unwind: '$rating'
};

const filmByIdGroup = {
    $group: {
        _id: '$title',
        released: {$first: '$released'},
        studio: {$first: '$studio.name'},
        averageRating: { $avg: '$rating.rating' }
    },
};

const sortByRating = { '$sort': { 'averageRating' : -1 } };

const limit = { '$limit': 10 };

module.exports = {
    filmAvg
};