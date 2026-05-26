import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const userId = req.user._id;

    // check whether the channel exists
    const channel = await User.findById(channelId);
    if(!channel) {
        throw new ApiError(404, 'Channel not found');
    };

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
            $match: { channel: channelId }
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
                'subscriber.username': 1,
                'subscriber.avatar': 1,
                'subscriber.createdAt': 1,
            }
        }
    ]);

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
    toggleSubscription
}
