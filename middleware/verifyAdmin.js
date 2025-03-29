import jwt from "jsonwebtoken";

const SECRET_KEY = "QagMUKBIQIT0IMcA9Jd8Lp5l3MpJjr4YRqGJI9br4cP8sR55PG4eh3xEJUoURqg5";

// Middleware to verify if the user is an admin
export const verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // Assuming you have a field in your user model called 'role' to track if the user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: "Access forbidden: Admins only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({ message: "Error verifying admin", error });
  }
};
