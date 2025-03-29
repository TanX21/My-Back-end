import user from "../models/user.models.js";
import ContactForm from "../models/ContactForm.js";
import Favorite from "../models/favorite.model.js";


// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await user.find().select("-password"); // Exclude password from user data
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Get all contact form submissions (admin only)
export const getAllContactForms = async (req, res) => {
  try {
    const contactForms = await ContactForm.find();
    res.status(200).json({ contactForms });
  } catch (error) {
    console.error("Error fetching contact forms:", error);
    res.status(500).json({ message: "Error fetching contact forms", error });
  }
};

export const getAllUsersFavorites = async (req, res) => {
    try {
      // Check if the logged-in user is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied, Admins only" });
      }
  
      // Fetch all users
      const allUsers = await user.find({}).select('username favorites');
  
      if (!allUsers) {
        return res.status(404).json({ message: "No users found" });
      }
  
      // Fetch favorites for each user
      const allFavorites = await Promise.all(
        allUsers.map(async (user) => {
          const userFavorites = await Favorite.findOne({ userId: user._id }).populate("books");
          return {
            username: user.username,
            favorites: userFavorites ? userFavorites.books : [],
          };
        })
      );
  
      // Return all users' favorites
      res.status(200).json(allFavorites);
    } catch (error) {
      res.status(500).json({ message: "Error fetching all users' favorites", error });
    }
  };