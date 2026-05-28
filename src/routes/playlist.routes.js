import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addVideoToPlaylist, createPlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route('/').post(createPlaylist).get(getUserPlaylists);
router.route('/:playlistId').get(getPlaylistById);
router.route('/add/:playlistId/:videoId').patch(addVideoToPlaylist);
router.route('/remove/:playlistId/:videoId').patch(removeVideoFromPlaylist);
router.route('/update/:playlistId').patch(updatePlaylist)

export default router;