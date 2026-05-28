import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { toggleCommentLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT);

router.route('/like-video/:videoId').post(toggleVideoLike);
router.route('/like-comment/:commentId').post(toggleCommentLike);

export default router