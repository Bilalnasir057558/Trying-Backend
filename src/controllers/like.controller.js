import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";


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

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    const comment = await Comment.findById(commentId);
    if(!comment) {
        throw new ApiError(404, "Comment not found")
    };

    // check if the comment is already liked or not
    const isLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    let likedComment;
    if(!isLiked) {
        likedComment = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
    } else {
        await Like.deleteOne({
            comment: commentId,
            likedBy: req.user._id
        })
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedComment || {},
            likedComment ? 'Like added to comment successfully' : 'Like removed from the comment successfully'
        )
    );

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, 'Invalid tweetId');
    };

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) {
        throw new ApiError(404, 'Tweet not found');
    };

    // check if already liked
    const isLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    let likedTweet;
    if(!isLiked) {
        likedTweet = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        });
    } else {
        await Like.deleteOne({
            tweet: tweetId,
            likedBy: req.user._id
        });
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedTweet || {},
            likedTweet ? 'Like added to tweet successfully' : 'Like removed from the tweet successfully'
        )
    ); 
});

const getLikedVideos = asyncHandler (async (req, res) => {
    const userId = req.user._id;

    const videos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {
                    $exists: true,  // check video field exists
                    $ne: null // video field can't be null
                }
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'videos'
            }
        },
        {
            $unwind: '$videos' // deconstructs array and give document for each element
        },
        {
            $project: {
                _id: 1,
                likedBy: 1,
                'videos._id': 1,
                'videos.thumbnail': 1,
                'videos.title': 1,
                'videos.duration': 1,
                'videos.createdAt': 1,
                'videos.updatedAt': 1
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            'Videos fetched successfully'
        )
    );
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}