// Import multer for handling file uploads
import multer from "multer";

// Configure the storage engine for multer
const storage = multer.diskStorage({
  // Set the destination for uploaded files
  destination: function (req, file, cb) {
    cb(null, "./public/tmp"); // Store files in the './public/tmp' directory
  },
  // Set the filename for uploaded files
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name for storage
  }
});

// Export the configured multer instance for file uploads
export const upload = multer({ storage: storage });
