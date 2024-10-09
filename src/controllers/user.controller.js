import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


// method for access and refresh token 
const generateAccessAndRefreshToken = async (userId) => {
     try {

          // Find the user in the database by their ID
          const user = await User.findById(userId);

          // console.log("User ID for token generation:", userId);

          // Generate the access token using a method on the user model
          const accessToken = user.generateAccessToken();

          // Generate the refresh token using a method on the user model
          const refreshToken = user.generateRefreshToken();


          // Store the refresh token in the user's record in the database
          user.refreshToken = refreshToken;

          // Save the user document with the updated refresh token, without running validations
          await user.save({ validateBeforeSave: false });

          // Return both the access and refresh tokens
          return { accessToken, refreshToken };
          

     } catch (error) {
          // If an error occurs, throw a custom error with status code 500
          throw new ApiError(500, 
               "Something went wrong while generating refresh and access token");
     }
}

// Register user
const registerUser = asyncHandler(async (req,res)=> {

        //    get user details from frontend
        //    validation - not empty
        //    check if user already exits or not : username , email
        //    check for images ,check for avatar 
        //    upload them to cloudinary 
        //    create user object - create entry in db
        //    remove password and refresh token field from  response 
        //    check  for user creation 
        //    return res 

           const {fullName, username, email,password}= req.body
           console.log("email:",email);

          //  console.log("req ki body" ,req.body);

           // chekc for the user fill info are not 
           // if(fullName==""){
           // throw new ApiError(400,"Full name is required");
           //}

           // chekc for the value are empty or not 
           if(
            [fullName,username,email,password].some((field)=>
                  field?.trim()=== "")
           ){
            throw new ApiError(400,"all Field are  required");
           }

          //check user are already exists are not with the help of name , email
          const existedUser = await User.findOne({
               $or: [{username},{email}]
           })

          //  console.log("existed user",existedUser);

           if(existedUser){
               throw new ApiError(409,"User with email or username already exists");
           }



           // check for images ,check for avatar 
           const avatarLocalPath = req.files?.avatar?.[0]?.path;
           console.log("avatarLocalPath ",avatarLocalPath);
           let  coverImageLocalPath = req.files?.coverImage?.[0]?.path;

           
           if(req.files && Array.isArray(req.files.coverImage)&&req.files.coverImageLocalPath>0){
               coverImageLocalPath = req.files.coverImage?.[0]?.path
           }

           if(!avatarLocalPath){
               throw new ApiError(400,"Avatar file path is required");
           }
           
    
           // upload them to cloudinary
           const avatar = await uploadOnCloudinary(avatarLocalPath)
          const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

          if(!avatar){
               throw new ApiError(400,"Avatar file is required");
          }

          //create Entry in database
          const user = await User.create({
               fullName,
               avatar:avatar.url,
               coverImage:coverImage?.url || "",  
               email,
               password,
               username:username.toLowerCase()
          })
          
          
           
          //remove password and refresh token field from  response 
          const createUser = await User.findById(user._id).select(
               "-password -refreshToken"  // -sign means that was remove or not include
          )

          // user creation  check 
          if(!createUser){
               throw new ApiError(500,"Something went wrong while registering the User");
          }

          //return response
          console.log("User Registered SuccessFully")
          return res.status(201).json(
               new ApiResponse(200,createUser,"User registered SuccessFully")
          )  

})

// Login User
 //req.body -> data
     // username or email
     // find user
     // password check
     // refresh token  and access token 
     // send cookies 

// handle the login process
const loginUser = asyncHandler(async (req, res) => {
     // Destructure the email, username, and password from the request body
     const { email, username, password } = req.body;

     // console.log("Login data:", req.body);
     // console.log("Email",email);

     // Ensure the user provided either a username or an email
     if (!(username || email)) {
          throw new ApiError(400, "Username or Email is required");
     }

     // Find the user by email or username using MongoDB's $or operator
     const user = await User.findOne({
          $or: [{ email }, { username }],
     });

     
     // If no user is found, throw a 404 error
     if (!user) {
          throw new ApiError(404, "User not found");
     }

     // Check if the password provided matches the user's password in the database
     const isPasswordValid = await user.isPasswordCorrect(password);

     

     // If the password is incorrect, throw a 401 error
     if (!isPasswordValid) {
          throw new ApiError(401, "Password Incorrect");
     }

     // Generate access and refresh tokens for the authenticated user
     const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

     // console.log("AccessToken", accessToken);
     // console.log("refreshToken",refreshToken)

     // Fetch the user again without sensitive data like password and refreshToken
     const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

     // Set cookie options to make them secure and inaccessible to client-side JavaScript
     const options = {
          httpOnly: true,
          secure: true,
     };

     // Send response with the tokens and user data
     console.log("User LoggedIn Successfully");
     return res
          .status(200)
          .cookie("accessToken", accessToken, options)  // Set the access token as a cookie
          .cookie("refreshToken", refreshToken, options)  // Set the refresh token as a cookie
          .json(
               new ApiResponse(
                    200,
                    {
                         user: loggedInUser,
                         accessToken,
                         refreshToken
                    },
                    "User LoggedIn Successfully"
               )
          );
         
});

//Logout User 
const logoutUser = asyncHandler(async (req, res) => {

     // Update the user by finding their record using the user ID and clearing the refresh token.
     await User.findByIdAndUpdate(
         req.user_id, // Finds the user by their ID stored in `req.user_id`.
         {
             $set: {
                 refreshToken: undefined // Clears the user's refresh token.
             }
         },
         {
             new: true, // Returns the updated user document after the refresh token is removed.
         }
     );
 
     // Options for clearing the cookies, ensuring they are HTTP-only and secure.
     const options = {
         httpOnly: true,
         secure: true,
     };
 
     // Respond with success, clearing the access token and refresh token cookies from the user's browser.
     console.log("User Logged Out SuccessFully")
     return res
         .status(200)
         .clearCookie("accessToken", options) // Clears the `accessToken` cookie.
         .clearCookie("refreshToken", options) // Clears the `refreshToken` cookie 
         .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
         
 });

 
 const REFRESH_TOKEN_SECRET = "123456"  // manually aded 
 // Function to refresh the access token
const refreshAccessToken = asyncHandler(async (req, res) => {
     // Get the incoming refresh token from cookies or request body
     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
 
     // Check if the incoming refresh token is present
     if (!incomingRefreshToken) {
         throw new ApiError(401, "Unauthorized request");
     }
 
     try {
         // Verify the incoming refresh token
         const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);
 
         // Find the user associated with the refresh token
         const user = await User.findById(decodedToken?._id);
 
         // Check if the user exists
         if (!user) {
             throw new ApiError(401, "Invalid RefreshToken");
         }
 
         // Verify if the incoming refresh token matches the user's stored refresh token
         if (incomingRefreshToken !== user?.refreshToken) {
             throw new ApiError(401, "Refresh token is expired or used");
         }
 
         // Options for secure cookie handling
         const options = {
             httpOnly: true,
             secure: true,
         };
 
         // Generate new access and refresh tokens
         const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
 
         // Respond with the new tokens and set them as cookies
         return res
             .status(200)
             .cookie("accessToken", accessToken, options)
             .cookie("refreshToken", newRefreshToken, options)
             .json(
                 new ApiResponse(
                     200,
                     { accessToken, refreshToken: newRefreshToken },
                     "Access token refreshed"
                 )
             );
     } catch (error) {
         // Handle any error that occurs during token verification or user lookup
         throw new ApiError(401, error?.message || "Invalid RefreshToken");
     }
 });

 // ChangePassword 
 const ChangeCurrentPassword = asyncHandler(async (req,res)=>{
     const {oldPassword, newPassword,confPassword} = req.body;

     if(!(newPassword===confPassword)){
          throw new ApiError(400,"Invalid Old Password");   
     }

     const user =  await User.findById(req.user?._id)

    const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
     throw new ApiError(400,"Invalid Old Password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave:false})

    return res 
    .status
    .json(new ApiResponse(200,{},"Password Change Successfully"))


 })

 //get CurrentUser 
 const getCurrentUser = asyncHandler(async(req,res)=>{
     return res
     .status(200)
     .json(200, req.user ,"Current User Fetched SuccessFully");
 })

 //Update Account Details 
  const updateAccountDetail = asyncHandler(async(req,res)=>{
     const {fullName,email} = req.body;

     if(!(email||fullName)){
          throw new ApiError(400,"All Fields are required");
     }

     const user = User.findByIdAndUpdate(
          req.user?._id,
          {
               $set:{
                    fullName,
                    email
               }
          },
          {new:true}
     ).select("-password")

     return res
      .status(200)
      .json(new ApiResponse(200,user,"Account Details Updated Successfully"))
  }) 




export {registerUser ,loginUser,logoutUser,refreshAccessToken,
     ChangeCurrentPassword,getCurrentUser,updateAccountDetail}