import express from "express"; // Import the Express framework
import cors from "cors"; // Import the CORS middleware
import cookieParser from "cookie-parser"; // Import the cookie-parser middleware

// Create an instance of an Express application
const app = express();

// For enabling Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,  
    credentials: true, // allow req 
  })
);

// Middleware to parse incoming JSON requests with a limit on the request body size
app.use(express.json({ limits: "16kb" })); 


// Middleware to parse URL-encoded data from incoming requests
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //

// Serve static files from the "public" directory
app.use(express.static("public")); 

// Middleware to parse cookies from the incoming requests
app.use(cookieParser()); 


// Import Routes
import userRouter from "./routes/user.routes.js";


//Router Declaration 
app.use("/api/v1/users",userRouter);


// htttps://localhost:8000/api/v1/users/register







export { app };
