const jwt = require("jsonwebtoken");


module.exports = async function isAuthenticated(req, res, next) {
    const token = req.headers["authorization"] ? req.headers["authorization"].split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }

    try {
        const user = jwt.verify(token, "secret");
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token"});
    }
};
