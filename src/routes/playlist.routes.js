import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createPlaylist } from "../controllers/playlist.controller";

const router = Router();
router.use(verifyJWT);

router.route('/').post(createPlaylist);