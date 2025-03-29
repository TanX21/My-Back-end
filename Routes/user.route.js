import { Router } from "express";
import { Login, signUp, getUser, getFavoritesCount, logout, verifyOtp, resetPassword, forgotPassword, verifyResetPasswordOtp } from "../controllers/user.controller.js";  // Add the getUser method
import verifyToken from "../middleware/verifyToken.js";  // We will create this middleware
import favrouter from "./favorite.route.js";
import upload from "../middleware/multer.middleware.js";
const router = Router();

router.route("/signup").post(upload.single("profilePicture"), signUp);
router.route("/login").post(Login);

// Route to get the authenticated user (protected route)
router.route("/").get(verifyToken, getUser); // This route is protected, it checks the token
router.route("/favorites/count").get(getFavoritesCount);
router.route("/logout").post(logout);

router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-verification").post(verifyResetPasswordOtp);

export default router;
