const error = (error, req, res, next) => {
    return res.status(400).json({
        status: false,
        error: String(error),
    });
};

module.exports = error;