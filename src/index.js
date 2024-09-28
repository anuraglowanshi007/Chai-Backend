// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import express from "express"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
      path:'./.env'
});


connectDB()
.then(()=>{
      app.listen(process.env.PORT || 8000,()=>{
             console.log(`Server is running in port : ${process.env.PORT}`);
      });
})
.catch((err)=>{
      console.log("MongoDb Connection Failed !!",err);
})


// Apprach 2 
/*
import express from 'express';
const app = express()

(async ()=>{
      try{
            mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            app.on("error",()=>{
                  console.log("error",error);
                  throw error
            })

            app.listen(process.env.PORT,()=>{
                  console.log(`App is listen on port ${process.env.PORT}`);
            })

      }
      catch(error){
            console.log("Error:",error);
            throw error
      }
})
      */