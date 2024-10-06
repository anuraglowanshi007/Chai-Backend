import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt, { decode } from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Middleware to verify the JWT and authorize user requests
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Extract the access token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        // If no token is provided, throw a 401 Unauthorized error
        if (!token) {
            throw new ApiError(401, "Unauthorized Request");
        }

        // Verify the token using the secret key stored in environment variables
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Fetch the user from the database using the decoded token's user ID
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        // If no user is found, throw an error and discuss the frontend behavior
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Attach the user object to the request for further use in the route handler
        req.user = user;
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        // Catch any errors, whether from token verification or database query, and return a 401 error
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});
