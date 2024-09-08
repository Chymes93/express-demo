function log(req, res, next) {
    console.log("Authenticate...");
    next();
}

module.exports = log;