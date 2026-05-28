import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route('/').post(createPlaylist)
router.route('/:userId').get(getUserPlaylists);
router.route('/get-playlist/:playlistId').get(getPlaylistById);
router.route('/add/:playlistId/:videoId').patch(addVideoToPlaylist);
router.route('/remove/:playlistId/:videoId').patch(removeVideoFromPlaylist);
router.route('/update/:playlistId').patch(updatePlaylist);
router.route('/delete/:playlistId').delete(deletePlaylist);

export default router;