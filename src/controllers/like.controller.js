import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    // check if the video exists or not
    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found");
    };

    // check if already liked
    const isLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    let likedVideo;
    if(!isLiked) {
        likedVideo = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
    } else {
        await Like.findOneAndDelete({
            video: videoId,
            likedBy: req.user._id
        });
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedVideo || {},
            likedVideo ? 'Like added to video successfully' : 'Like removed from the video successfully'
        )
    );
})

const 

export {
    toggleVideoLike
}