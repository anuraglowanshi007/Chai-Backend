import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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
           const avatarLocalPath = req.files?.avatar[0]?.path;
           console.log("avatarLocalPath ",avatarLocalPath);
           const coverImageLocalPath = req.files?.coverImage[0].path;

     
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
          return res.status(201).json(
               new ApiResponse(200,createUser,"User registered SuccessFully")
          )  

})

export {registerUser}