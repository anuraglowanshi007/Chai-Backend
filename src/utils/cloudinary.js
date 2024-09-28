import {v2 as cloudinary} from cloudinary
import fs from "fs" 

cloudinary.config({
  cloud_name:'process.env.CLOUD_NAME',
  api_key:'process.env.API_KEY',
  api_secret:'process.env.API_SECRET'
});

const uploadCloudinary = async(localFilePath)=>{
  try{
    if(!localFilePath) return null;

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload
    (localFilePath,{
      resource_type:'auto'
    })

    //file has been uploaded successfully
    console.log("file is uploaded on cloudinary",response.url);
    return response;
  }
  catch(error){
    //remove locally saved temporary file as the upload operation  got failed 
    fs.unlinkSync(localFilePath)
    return null;
  }
}

export {uploadCloudinary};


// const cloudinary = require("cloudinary").v2
// exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
//   const options = { folder }
//   if (height) {
//     options.height = height
//   }
//   if (quality) {
//     options.quality = quality
//   }
//   options.resource_type = "auto"
//   console.log("OPTIONS", options)
//   return await cloudinary.uploader.upload(file.tempFilePath, options)
// }
