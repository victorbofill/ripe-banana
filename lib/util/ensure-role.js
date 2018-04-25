module.exports = function(requiredRole) {
    return (req, res, next) => {
        if(req.user.role.every(r => r !== requiredRole)) {
            next({
                status: 403,
                error: `requires ${requiredRole} role`
            });
        }
    };
};