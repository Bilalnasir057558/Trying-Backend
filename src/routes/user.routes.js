import { Router } from "express";
import {getCurrentUser, getUserChannelProfile, loginUser, logoutUser, refreshAccessToken, registerUser, updateAvatar, updateCoverImage, updateOtherFields, updatePassword} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route('/login').post(loginUser);

// secured route
router.route('/logout').post(
    verifyJWT,
    logoutUser
)

router.route('/refresh-accessToken').post(refreshAccessToken);

router.route('/update-password').patch(verifyJWT, updatePassword);

router.route('/update-user-data').patch(verifyJWT, updateOtherFields);

router.route('/update-avatar').patch(
    verifyJWT, // gives access to req.user 
    upload.single('avatar'), // gives access to req.file
    updateAvatar
);

router.route('/update-coverImage').patch(
    verifyJWT,
    upload.single('coverImage'),
    updateCoverImage
);

router.route('/get-current-user').get(
    verifyJWT,
    getCurrentUser
);

router.route('/get-channel/:username').get(
    verifyJWT, 
    getUserChannelProfile
)

export default router;