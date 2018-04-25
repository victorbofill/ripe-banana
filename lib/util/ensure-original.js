const Review = require('../models/Review');


module.exports = function() {
    return (req, res, next) => {

        const current_id = req.get('User');
        const review_id = req.body._id || req.params.id;

        Review.findById(review_id)
            .lean()
            .then( review => {
                const original_id = review.reviewer.toString();
                if (current_id !== original_id){
                    next({
                        status: 403,
                        error: `only the original author can edit reviews`
                    });
                }
                else next();
            });
    };
};
