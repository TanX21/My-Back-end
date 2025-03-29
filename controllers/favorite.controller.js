// controllers/favorite.controller.js
import Favorite from "../models/favorite.model.js";
import ContactForm from "../models/ContactForm.js";

// Add favorite book to MongoDB
export const addFavorite = async (req, res) => {
  try {
    const { book } = req.body;  // Expecting book info in the request body
    const userId = req.user.userId; // Get userId from the verified token

    // Check if the user already has favorites
    let favorite = await Favorite.findOne({ userId });

    if (!favorite) {
      // If the user doesn't have favorites, create a new document with the first book
      favorite = new Favorite({ userId, books: [book] });
    } else {
      // If the user has favorites, check if the book already exists
      const isBookAlreadyFavorite = favorite.books.some(favBook => favBook.id === book.id);

      if (isBookAlreadyFavorite) {
        return res.status(400).json({ message: "This book is already in your favorites!" });
      }

      // If the book isn't already a favorite, add it to the list
      favorite.books.push(book);
    }

    await favorite.save();
    res.status(200).json({ message: "Favorite book added successfully", favorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding favorite book", error });
  }
};


// Get all favorite books of the logged-in user
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch the user's favorites from the Favorite collection
    const favorite = await Favorite.findOne({ userId }).populate("userId", "username");

    // If the user does not have any favorites, return an empty array
    if (!favorite || !favorite.books || favorite.books.length === 0) {
      return res.status(200).json([]); // Return an empty array instead of a 404
    }

    // Return the favorite books array if favorites exist
    res.status(200).json(favorite.books);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Error fetching favorites", error });
  }
};

// controllers/favorite.controller.js

// Remove a favorite book from the MongoDB
// controllers/favorite.controller.js
export const removeFavorite = async (req, res) => {
    try {
      const { bookId } = req.params;  // Extracting bookId from URL params
      const userId = req.user.userId; // Get userId from the verified token
  
      // Find the user's favorite list
      const favorite = await Favorite.findOne({ userId });
  
      if (!favorite) {
        return res.status(404).json({ message: "No favorites found for this user" });
      }
  
      // Find the index of the book to be removed in the books array
      const bookIndex = favorite.books.findIndex((book) => book._id.toString() === bookId);
  
      if (bookIndex === -1) {
        return res.status(404).json({ message: "Book not found in favorites" });
      }
  
      // Remove the book from the array
      favorite.books.splice(bookIndex, 1);
  
      // Save the updated favorite list
      await favorite.save();
  
      res.status(200).json({ message: "Book removed from favorites successfully", favorite });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error removing favorite book", error });
    }
};


export const contactFormHandler = async (req, res) => {
  const { name, email, message } = req.body;

  // Simple validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    // Create a new contact form entry and save to MongoDB
    const contactMessage = new ContactForm({
      name,
      email,
      message,
    });

    // Save the contact form data in MongoDB
    await contactMessage.save();

    // Send success response with saved contact info
    res.status(200).json({
      success: 'Your message has been saved successfully!',
      contactMessage: {
        name: contactMessage.name,
        email: contactMessage.email,
        message: contactMessage.message,
      },
    });
  } catch (error) {
    console.error('Error saving contact form:', error);
    res.status(500).json({ error: 'An error occurred while saving your message.' });
  }
};




  