
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// does not taking path from .env 
cloudinary.config({
    cloud_name:  "dzm0r3isf",
    api_key: "568539712321726",
    api_secret: "0zVN7bgpwT1EMu4YVrb_00dvtNA"
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });

        console.log("File uploaded to Cloudinary:", response.url);
        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message);
        // Check if the local file exists before attempting to delete it
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("Temporary file deleted:", localFilePath);
        } else {
            console.warn("Temporary file not found for deletion:", localFilePath);
        }
        return null;
    }
};

export { uploadOnCloudinary };


//     //file has been uploaded successfully
//     console.log("file is uploaded on cloudinary",response.url);
//     return response;
//   }
//   catch(error){
//     //remove locally saved temporary file as the upload operation  got failed 
//     fs.unlinkSync(localFilePath)
//     return null;
//   }
// }

// export {uploadOnCloudinary};


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
