import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
      {
             username:{
                  type:String,
                  required:true,
                  unique:true,
                  lowercase:true,
                  trim:true,
                  index:true,
                  
             },
             email:{
                  type:String,
                  required:true,
                  unique:true,
                  lowercase:true,
                  trim:true,
                  
             },
             fullname:{
                  type:String,
                  required:true,
                  lowercase:true,
                  trim:true,
                  index: true,
             },
             avtar:{
                  type:String,  // cloudinary url
                  required:true,
             },
             coverImage:{
                  type:String ,  // cloudinary url
             },
             watchHistory:{
                  type:Schema.Types.ObjectId,
                  ref:"video"
             },
             password:{
                  type:String,
                  reqired:[true,'Password is required']
             },
             refreshToken:{
                  type:String,
             }
      },
      {
            timestamps:true,
      }
)

// pre & many.. hook is used to bcrypt data 
userSchema.pre("save",function async (next){

      if(!this.isModified("password")) return next();

      this.password = bcrypt.hash(this.password,10);
      next();
})

// Custom method 
userSchema.methods.isPasswordCorrect = async function 
 (password) {
      return await bcrypt.compare(password,this.password)  
}

// access token 
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
      {
            _id : this._id,
            email: this.email,
            username : this.username,
            fullname:this.fullname
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY;
      }
    )
    
}

// refresh token 
userSchema.methods.generateRefreshToken = function(){
      return jwt.sign(
            {
                  _id : this._id,
            }, 
            process.env.REFRESH_TOKEN_SECRET,
            {
                  expiresIn : process.env.REFRESH_TOKEN_EXPIRY;
            }
          )
}

export const User = mongoose.model("User,userSchema");