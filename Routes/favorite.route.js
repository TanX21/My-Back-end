// routes/favorite.route.js
import { Router } from "express";
import { addFavorite, getFavorites, removeFavorite, contactFormHandler} from '../controllers/favorite.controller.js';
import verifyToken from '../middleware/verifyToken.js'; // Ensure the user is authenticated
// import ContactForm from "../models/ContactForm.js";

const favrouter = Router();

// Route to add a book to favorites
favrouter.post('/add', verifyToken, addFavorite);

// Route to get all favorite books for a user
favrouter.get('/', verifyToken, getFavorites); 

// Route to remove a book from favorites (with bookId as a URL parameter)
favrouter.delete('/remove/:bookId', verifyToken, removeFavorite); // Route now correctly takes bookId in URL

//Contact Form
favrouter.post('/contact', contactFormHandler);

export default favrouter;
