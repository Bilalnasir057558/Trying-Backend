import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/")
    .get(getAllVideos);

router.route('/publish-video').post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishVideo
);

router.route('/get-video').get(getVideoById);

router.route('/update-video/:videoId').patch(updateVideo);

router.route('/delete-video/:videoId').delete(deleteVideo);

router.route('/toggle-publish-status/:videoId').patch(togglePublishStatus);

export default router;