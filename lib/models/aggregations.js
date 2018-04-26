//TO DO: add aggregations

const filmAvg =  [
    {
        $lookup: {
            from: 'studios',
            localField: 'studio',
            foreignField: '_id',
            as: 'studio'
        }
    },{
        $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'film',
            as: 'rating'
        }
    },{
        $unwind: '$rating'
    },{
        $group: {
            _id: '$title',
            released: {$first: '$released'},
            studio: {$first: '$studio.name'},
            averageRating: { $avg: '$rating.rating' }
        },
    }
];

module.exports = {
    filmAvg
};