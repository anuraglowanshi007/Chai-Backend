import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the user schema with fields and configurations
const userSchema = new Schema(
  {
    // Username field: must be unique, lowercase, trimmed, and indexed
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    
    // Email field: must be unique, lowercase, trimmed, and required
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    
    // Fullname field: lowercase, trimmed, indexed, and required
    fullname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    
    // Avatar field: stores the Cloudinary URL of the user's avatar image
    avatar: {
      type: String, // Stores the URL of the user's avatar
      required: true,
    },
    
    // Cover Image field: optional Cloudinary URL for the user's cover image
    coverImage: {
      type: String, // Stores the URL of the cover image (optional)
    },
    
    // Watch history field: references the "video" collection (ObjectId type)
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "video", // Refers to 'video' model in MongoDB
    },
    
    // Password field: hashed password, required with a custom message
    password: {
      type: String,
      required: [true, 'Password is required'], // Custom validation error message
    },
    
    // Refresh Token field: stores the refresh token for the user
    refreshToken: {
      type: String, // Will store JWT refresh tokens
    }
  },
  
  {
    // Automatically adds createdAt and updatedAt timestamps to the document
    timestamps: true,
  }
);


// Pre-save hook to hash the password before saving to the database
userSchema.pre("save", async function (next) {
  // If the password hasn't been modified, move on to the next middleware
  if (!this.isModified("password")) return next();
  
  // Hash the password with bcrypt and store it in the password field
  this.password = await bcrypt.hash(this.password, 10); // Use bcrypt to hash the password with a salt round of 10
  
  next(); // Continue to the next middleware
});


// Custom method to check if a provided password matches the hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  // Compares the plaintext password with the hashed password in the database
  return await bcrypt.compare(password, this.password); // Returns true if passwords match, false otherwise
};


// Method to generate an access token for the user
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id, // Include the user's ID in the token payload
      email: this.email, // Include the user's email
      username: this.username, // Include the user's username
      fullname: this.fullname, // Include the user's fullname
    },
    process.env.ACCESS_TOKEN_SECRET, // Use the secret key for signing the access token
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Set the expiry time for the access token (from environment variable)
    }
  );
};



// Method to generate a refresh token for the user
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id, // Include the user's ID in the refresh token payload
    },
    process.env.REFRESH_TOKEN_SECRET, // Use the secret key for signing the refresh token
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Set the expiry time for the refresh token (from environment variable)
    }
  );
};

// Create and export the User model based on the userSchema
export const User = mongoose.model("User", userSchema);
