import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse } from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";


const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;

    if(!content || (typeof content === 'string' && !content.trim())) {
        throw new ApiError(400, 'Content is required');
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    const formattedResponse = {
        _id: tweet._id,
        content: tweet.content,
        ownerId: tweet.owner,
        ownerUsername: req.user.username,
        ownerAvatar: req.user.avatar
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            formattedResponse,
            'Tweet created successfully'
        )
    );
})

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'tweetOwner'
            }
        },
        {
            $addFields: {
                tweetOwner: {
                    $first: '$tweetOwner'
                }
            }
        },
        {
            $project: {
                'tweetOwner.username': 1,
                'tweetOwner.avatar': 1,
                content: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets,
            'Tweets fetched successfully'
        )
    );
})

const updateTweet = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {tweetId} = req.params;
    const {content} = req.body;

    if(!content || (typeof content === 'string' && !content.trim())) {
        throw new ApiError(400, 'Content is required');
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) {
        throw new ApiError(404, 'Tweet not found');
    };

    const isOwner = tweet.owner.toString() === userId.toString();
    if(!isOwner) {
        throw new ApiError(403, 'Only owner can delete the tweet')
    };

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        }, 
        {
            returnDocument: "after"
        }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedTweet,
            'Tweet updated successfully'
        )
    );

})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    const userId = req.user._id;

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) {
        throw new ApiError(404, 'Tweet not found');
    };

    const isOwner = tweet.owner.toString() === userId.toString();
    if(!isOwner) {
        throw new ApiError(403, 'Only owner can delete the tweet')
    };

    await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            'Tweet delete successfully'
        )
    );
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}