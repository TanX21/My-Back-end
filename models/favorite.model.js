// models/favorite.model.js
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",  // This references the User model
    required: true
  },
  books: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    authors: { type: [String], required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true }
  }]
});

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
