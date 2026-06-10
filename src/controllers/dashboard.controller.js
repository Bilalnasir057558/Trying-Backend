import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Video} from '../models/video.model.js';
import {Like} from "../models/like.model.js"
import mongoose from "mongoose";

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id;

    const channelStats = await Video.aggregate([
        {
            $match: {
                isPublished: true,
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'video',
                as: 'likes'
            }
        },
        {
            $group: { // combines multiple documents with the same field, fields
                _id: null,  // group by nothing (gives all documents)
                totalVideos: {
                    $sum: 1
                },
                totalViews: {
                    $sum: '$views'
                },
                totalLikes: {
                    $sum: {
                        $size: '$likes'
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                let: {},
                pipeline: [
                    { 
                        $match: {
                            channel: new mongoose.Types.ObjectId(channelId)
                        }
                    }
                ],
                as: 'subscribers'
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: '$subscribers'
                }
            }
        },
        {
            $project: {
                totalViews: 1,
                subscribersCount: 1,
                totalVideos: 1,
                totalLikes: 1
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channelStats,
            'Channel Stats fetched successfully'
        )
    )
})

const getVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                title: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1
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
    getChannelStats,
    getVideos
}