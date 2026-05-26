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
     const userId = req.user._id;
     const {subscriberId} = req.params;
     
     if(!subscriberId || (typeof subscriberId === 'string' && !subscriberId.trim())) {
        throw new ApiError(400, 'SubscriberId is required');
     }

     // check if the subscriber exists or not
     const subscriber = await User.findById(subscriberId);
     if(!subscriber) {
        throw new ApiError(404, 'Subscriber not found');
     };

     const channels = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        }, 
        {
            $lookup: {
                from: 'users',
                localField: 'channel',
                foreignField: '_id',
                as: 'channel'
            }
        }, 
        {
            $addFields: {
                channel: {
                    $first: '$channel'
                }
            }
        }, 
        {
            $project: {
                subscriber: 1,
                'channel._id': 1,
                'channel.username': 1,
                'channel.avatar': 1
            }
        }
     ]);

     if(!channels?.length) {
        throw new ApiError(404, 'No channels subscribed');
     }

     return res
     .status(200)
     .json(
        new ApiResponse(
            200,
            channels,
            'Channels fetched successfully'
        )
     )
})

export {
    toggleSubscription,
    getSubscribers,
    getChannels
}
