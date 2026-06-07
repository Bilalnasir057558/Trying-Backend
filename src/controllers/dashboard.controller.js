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
            $group: { // combines multiple documents with the same field, fields
                _id: null,  // group by nothing (gives all documents)
                totalVideos: {
                    $sum: 1
                },
                totalViews: {
                    $sum: '$views'
                },
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
            $lookup: {
                from: 'subscriptions',
                localField: 'owner',
                foreignField: 'channel',
                as: 'subscribers'
            }
        },
        {
            $addFields: {
                totalLikes: {
                    $size: '$likes'
                },
                subscibersCount: {
                    $size: '$subscribers'
                }
            }
        },
        {
            $project: {
                totalViews: 1,
                subscibersCount: 1,
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

export {
    getChannelStats
}