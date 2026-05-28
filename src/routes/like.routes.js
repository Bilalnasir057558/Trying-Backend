import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { toggleVideoLike } from "../controllers/like.controller";

const router = Router();
router.use(verifyJWT);

router.route('/like-video/:videoId').post(toggleVideoLike);

export default router