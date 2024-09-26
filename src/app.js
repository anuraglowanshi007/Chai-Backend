import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";

// For the cors 
app.use(cors({
      origin:process.env.CORS_ORIGIN,
      credentials:true

}))

// For the Json data limit use 
app.use(express.json({limits:"16kb"}))

// For the url 
app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"));
app.use(cookieParser());

const app = express();

 export {app}