import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse } from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10} = req.query;
    const {videoId} = req.params;

    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, 'Video not found');
    };

    const pipeline = [];

    // match object -> find all comment documents of a specific video
    const matchObject = {};
    if(video) {
        matchObject.video = new mongoose.Types.ObjectId(videoId);
    }
    pipeline.push({ $match: matchObject });    

    // lookup object -> fetch video information
    let videolookup = {};
    if(video) {
        videolookup = {
            from: 'videos',
            foreignField: '_id',
            localField: 'video',
            as: 'video'
        }
    };
    pipeline.push({ $lookup: videolookup })

    // lookup object -> to fetch owner details of each comment
    let ownerLookup = {
        from: 'users',
        foreignField: '_id',
        localField: 'owner',
        as: 'owner'
    };
    pipeline.push({ $lookup: ownerLookup })
    
    // addFieldObject -> to add video and owner details
    const addFields = {
        video: {
            $first: '$video'
        },
        owner: {
            $first: '$owner'
        }
    };

    pipeline.push({ $addFields: addFields });

    const project = {
        content: 1,
        'video.title': 1,
        'video.description': 1,
        'video.thumbnail': 1,
        'owner.username': 1,
        'owner.avatar': 1
    }
    pipeline.push({ $project: project });    

    const aggregate = Comment.aggregate(pipeline);
    const result = await Comment.aggregatePaginate(aggregate, {limit, page});

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalComments: result.totalDocs,
                comments: result.docs,
                limit: result.limit,
                totalPages: result.totalPages
            },
            'Comments fetched successfully'
        )
    );
}) 

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {content} = req.body;

    if(!content || (typeof content === 'string' && !content.trim())) {
        throw new ApiError(400, 'Comment text is required');
    }

    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, 'Video not found');
    };

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            'Comment added successfully'
        )
    );
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;

    const comment = await Comment.findById(commentId);
    if(!comment) {
        throw new ApiError(404, 'Comment not found');
    };

    const isOwner = comment.owner.toString() === req.user._id.toString();
    if(!isOwner) {
        throw new ApiError(403, 'Only comment owner can update the comment');
    };

    comment.content = content;
    await comment.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            'Comment updated successfully'
        )
    );
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    const comment = await Comment.findById(commentId);
    if(!comment) {
        throw new ApiError(404, 'Comment not found');
    };

    const isOwner = comment.owner.toString() === req.user._id.toString();
    if(!isOwner) {
        throw new ApiError(403, 'Only owner can delete the comment');
    };

    await Comment.findByIdAndDelete(commentId);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            'Comment deleted successfully'
        )
    );
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}