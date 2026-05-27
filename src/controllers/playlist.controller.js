import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if([name, description].some(field => 
        !field || (typeof field === 'string' && !field.trim())
    )) {
        throw new ApiError(400, 'All fields are required');
    };

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    });

    if(!playlist) {
        throw new ApiError(500, 'Error creating playlist');
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            'Playlist created successfully'
        )
    );
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid userId');
    };

    const playlists = await Playlist.find({
        owner: userId
    });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlists,
            'Playlists fetched successfully'
        )
    );
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, 'Invalid playlistId');
    };

    const playlist = await Playlist.findById(playlistId);
    if(!playlist) {
        throw new ApiError(500, 'Error fetching playlist')
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            'Playlist fetched successfully'
        )
    );



})
export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById
}