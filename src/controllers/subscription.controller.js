import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const userId = req.user._id;

    // check whether the channel exists
    const channel = await User.findById(channelId);
    if(!channel) {
        throw new ApiError(404, 'Channel not found');
    };

    // user cannot subscribe itself
    if(userId.toString() === channelId.toString()) {
        throw new ApiError(403, "You cannot subscribe yourself");
    }

    // if already subscribed (document exists) -> delete that subscription document
    // if document not found (not subscribed) -> create subscription
    const isSubscriptionExists = await Subscription.findOne({
        $and: [
            { subscriber: userId },
            { channel: channelId }
        ]
    });

    let subscription;
    if(!isSubscriptionExists) {
        subscription = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
    } else {
        await Subscription.deleteOne({
            subscriber: userId,
            channel: channelId
        })
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscription || {},
            subscription ? 'Subscription added successfully' : 'Subscription removed successfully'
        )
    );

})

const getSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    // check channel exists or not
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404, 'Channel not found');
    };

    const subscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'subscriber',
                as: 'subscriber'
            }
        },
        {
            $addFields: {
                subscriber: {
                    $first: '$subscriber'
                }
            }
        },
        {
            $project: {
                channel: 1,
                'subscriber._id': 1,
                'subscriber.username': 1,
                'subscriber.avatar': 1,
                createdAt: 1,
            }
        }
    ]);

    if(!subscribers?.length) {
        throw new ApiError(404, 'No subscribers found for this channel');
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribers,
            'Subscribers fetched successfully'
        )
    );
})

const getChannels = asyncHandler(async (req, res) => {
     
})

export {
    toggleSubscription,
    getSubscribers
}
