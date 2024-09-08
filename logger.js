function log(req, res, next) {
    console.log("Login...");
    next();
}

module.exports = log;