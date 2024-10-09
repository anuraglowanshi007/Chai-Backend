import { Router } from "express";
import { 
      ChangeCurrentPassword,
       getCurrentUser,
       getUserChangeProfile,
        getWatchHistory,
        loginUser, 
        logoutUser,
       refreshAccessToken, 
       registerUser, 
       updateAccountDetail,
       updateUserAvatar,
       updateUserCoverImage
 } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const userRouter = Router()

userRouter.route("/register").post(

      upload.fields([
            {
                  name:"avatar",
                  maxCount:1
            },
            {
                  name:"coverImage",
                  maxCount:1
            }

      ]),
      
  registerUser
)

userRouter.route("/login").post(loginUser)

// secured Routes
userRouter.route("/logout").post(verifyJWT,logoutUser)

userRouter.route("/refresh-token").post(refreshAccessToken);

userRouter.route("/change-password").post(verifyJWT,ChangeCurrentPassword);

userRouter.route("/current-user").get(verifyJWT,getCurrentUser);

userRouter.route("/update-account").patch(verifyJWT,updateAccountDetail);

userRouter.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);

userRouter.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);

userRouter.route("/c/:username").get(verifyJWT,getUserChangeProfile);

userRouter.route("/watch-history").get(verifyJWT,getWatchHistory)

export default userRouter;