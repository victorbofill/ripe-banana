module.exports = (log) => {
    return (req, res, next) => {
        log(`${req.method} ${req.url}`);
        next();
    };
};