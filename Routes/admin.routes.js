import express from "express";
import { getAllUsers, getAllContactForms, getAllUsersFavorites } from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js"; // A middleware to check if the user is an admin

const adminrouter = express.Router();

// Admin routes
adminrouter.get("/users", verifyAdmin, getAllUsers); // Admin can view all users
adminrouter.get("/contact-forms", verifyAdmin, getAllContactForms); // Admin can view all contact form submissions
adminrouter.get("/favorites", verifyAdmin, getAllUsersFavorites);

export default adminrouter;
