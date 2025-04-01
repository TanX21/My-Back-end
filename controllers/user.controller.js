import user from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendVerificationEmail from "../utils/sendEmail.js";
import path from 'path'; // Required for file path handling
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const SECRET_KEY = "QagMUKBIQIT0IMcA9Jd8Lp5l3MpJjr4YRqGJI9br4cP8sR55PG4eh3xEJUoURqg5";

// SignUp controller
export const signUp = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All Fields Required" });
  }

  try {
    const profilePicture = req.file;  // Assuming you're using multer or similar for file uploads

    if (!profilePicture) {
      return res.status(400).json({ message: "Avatar required!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the user already exists
    const fetchedUser = await user.findOne({ $or: [{ email }, { username }] });

    // OTP generator (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP Timer: OTP expires in 5 minutes
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Upload profile picture to Cloudinary
    const profilePicturePath = await uploadOnCloudinary(profilePicture.path);
    console.log('Cloudinary URL:', profilePicturePath.secure_url);  // Debugging Cloudinary response

    let newUser;

    if (fetchedUser) {
      // If user exists and is not verified, update the existing user
      if (!fetchedUser.isVerified) {
        fetchedUser.username = username;
        fetchedUser.password = hashedPassword; // Ensure password is hashed
        fetchedUser.otp = otp;
        fetchedUser.otpExpiry = otpExpiry;

        // Save profile picture URL if uploaded
        if (profilePicturePath) {
          fetchedUser.profilePictureUrl = profilePicturePath.secure_url;  // Attach secure_url to the user object
        }

        await fetchedUser.save();
        newUser = fetchedUser;  // Return the updated user
      } else {
        return res.status(400).json({ message: "User already exists and is verified" });
      }
    } else {
      // Create a new user if no existing user found
      newUser = await user.create({
        username,
        email,
        password: hashedPassword,
        otp,
        otpExpiry,
        profilePictureUrl: profilePicturePath.secure_url,  // Attach profile picture URL when creating a new user
      });
    }

    // Send OTP email
    await sendVerificationEmail(newUser.username, newUser.email, otp);

    // Send success response with profile picture URL
    return res.status(201).json({
      message: "User signed up successfully",
      user: {
        username: newUser.username,
        email: newUser.email,
        profilePictureUrl: newUser.profilePictureUrl,  // Include profilePictureUrl in the response
      },
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// OTP Verification Controller
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Log received data
  console.log("Received OTP:", otp);
  console.log("Received Email:", email);

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    // Fetch the user from the database and explicitly select otp and otpExpiry
    const foundUser = await user.findOne({ email }).select('otp otpExpiry isVerified');

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log OTP fetched from DB for debugging
    console.log("Found OTP in DB:", foundUser.otp);

    // Check if OTP has expired
    const currentTime = new Date();
    if (currentTime > foundUser.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired, please request a new one" });
    }

    // Verify OTP exists and is not undefined
    if (!otp || !foundUser.otp) {
      return res.status(400).json({ message: "OTP is missing" });
    }

    // Compare the OTP after trimming to avoid issues with spaces
    if (foundUser.otp.trim() !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is verified successfully
    foundUser.isVerified = true;
    foundUser.otp = null;  // Clear OTP after successful verification
    foundUser.otpExpiry = null;  // Clear OTP expiry date
    await foundUser.save();

    return res.status(200).json({
      message: "OTP verified successfully",
      user: { username: foundUser.username, email: foundUser.email, isVerified: foundUser.isVerified },
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Login controller
export const Login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username and explicitly include the password field
    const fetchedUser = await user.findOne({ username }).select('+password');  // Include password field

    if (!fetchedUser) {
      return res.status(400).json({ message: "User is not found" });
    }

    // Compare the password with the hashed password in the database
    const isPasswordCorrect = await bcrypt.compare(password, fetchedUser.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // Generate JWT token and include the role in the payload
    const token = jwt.sign(
      { 
        userId: fetchedUser._id, 
        username: fetchedUser.username, 
        email: fetchedUser.email,
        role: fetchedUser.role,  // Include the user's role in the JWT payload
      },
      SECRET_KEY,
      { expiresIn: '1h' }  // Token will expire in 1 hour
    );

    // Optionally, you can set the token in a cookie if required
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/", sameSite: "Strict", });

    return res.status(200).json({
      message: "User login successful",
      user: {
        username: fetchedUser.username,
        role: fetchedUser.role,  // Send the user's role back in the response
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Controller to get authenticated user's data
export const getUser = async (req, res) => {
  try {
    const fetchedUser = await user.findById(req.user.userId).select("-password"); // Exclude password field

    if (!fetchedUser) {
      return res.status(400).json({ message: "User not found" });
    }

    // return res.status(200).json({ username: fetchedUser.username, profilePictureUrl: fetchedUser.profilePictureUrl });
    return res.status(200).json({ user: fetchedUser});
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Controller to get favorite count
export const getFavoritesCount = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const currentUser = await user.findById(decoded.userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const favoritesCount = currentUser.favorites ? currentUser.favorites.length : 0;

    res.json({ favoritesCount });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Logout controller
export const logout = (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout", error });
  }
};

// Forget Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
      return res.status(400).json({ message: 'Email is required' });
  }

  try {
      const foundUser = await user.findOne({ email });
      if (!foundUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Generate OTP (6 digits)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // OTP Expiry Time (5 minutes)
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      
      // Update the user with the generated OTP and expiry
      foundUser.otp = otp;
      foundUser.otpExpiry = otpExpiry;
      await foundUser.save();

      // Send OTP to user's email
      await sendVerificationEmail(foundUser.username, foundUser.email, otp);

      return res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Verify OTP for password reset
export const verifyResetPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const foundUser = await user.findOne({ email }).select('otp otpExpiry'); // Ensure `otp` and `otpExpiry` are fetched

    if (!foundUser) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if OTP has expired
    const currentTime = new Date();
    // console.log("OTP Expiry:", foundUser.otpExpiry);
    // console.log("Current Time:", currentTime);
    if (currentTime > foundUser.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired, please request a new one" });
    }

    // Check if the OTP matches
    if (foundUser.otp.trim() !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is verified, allow the user to reset password
    return res.status(200).json({ message: "OTP verified successfully. You can now reset your password." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



// Reset Password
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and newPassword are required' });
  }

  try {
    const foundUser = await user.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password and update the user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    foundUser.password = hashedPassword;
    foundUser.otp = null; // Clear OTP after successful reset
    foundUser.otpExpiry = null;
    await foundUser.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
