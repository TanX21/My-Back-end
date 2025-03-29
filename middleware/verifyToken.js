// verifyToken.js
import jwt from "jsonwebtoken";

const SECRET_KEY = "QagMUKBIQIT0IMcA9Jd8Lp5l3MpJjr4YRqGJI9br4cP8sR55PG4eh3xEJUoURqg5";

const verifyToken = (req, res, next) => {
    const token = req.cookies.token; // Token is stored in cookies

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;  // Add user info to the request object
        next();
    });
};

export default verifyToken;

