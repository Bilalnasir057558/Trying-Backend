import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { query, sortBy = 'createdAt', sortType = 'asc', userId } = req.query;

    // empty pipeline array
    const pipeline = [];

    // filter object containing match conditions with base condition that the videos must be published
    const filter = {
        isPublished: true
    };

    // if query (text to search) exists, match it with the title or description of videos, 'i' for case insensitive
    // use $regex operator for full or partial matching
    if(query) {
        filter.$or = [
            {title: { $regex: query, $options: 'i' }},
            {description: { $regex: query, $options: 'i'}}
        ]
    };

    // if userId -> then add owner match
    if(userId) {
        filter.owner = new mongoose.Types.ObjectId(userId);
    };

    // push filter stage object to pipeline
    pipeline.push({ $match: filter })

    // create and push the lookup object for owner details
    const lookup = {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner'
    };
    
    pipeline.push({ $lookup: lookup})

    // addField stage to unwrap the owner array into a single object
    const addField = {
        owner: {
            $first: '$owner'
        }
    }
    pipeline.push({ $addFields: addField});

    // create and push the sort object to pipeline
    const sort = {};
    sort[sortBy] = sortType === 'desc' ? -1 : 1;

    pipeline.push({ $sort: sort });

    // calculate skip value
    const skip = (page - 1) * limit;

    // // $facet => data fetching and counting simultaneouly
    // pipeline.push({
    //     $facet: {
    //         metadata: [{ $count: 'totalVideos' }],
    //         videosData: [{ $skip: skip}, {$limit: limit}]
    //     }
    // })

    // // run the pipeline
    // const results = await Video.aggregate(pipeline);

    // // extract data from results
    // const videos = results[0]?.videosData || [];
    // const totalVideos = results[0]?.metadata[0]?.totalVideos || 0;

    // const totalPages = Math.ceil(totalVideos / limit);

    // Using aggregate paginate
    const aggregate = Video.aggregate(pipeline);
    log(aggregate);
    const result = await Video.aggregatePaginate(aggregate, { page, limit});
    console.log(result);
    

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalVideos: result.totalDocs,
                videos: result.docs,
                totalPages: result.totalPages,
                limit: result.limit
            },
            'Videos fetched successfully'
        )
    );

})

const publishVideo = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { videoId } = req.params;
    
    // find video
    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, 'Video not found');
    }

    // check if the user is owner or not
    const isOwner = video.owner.toString() === userId.toString();
    if(!isOwner) {
        throw new ApiError(403, 'Only owner can publish video');
    }

    // at this point, user is an owner 
    // update publish status
    video.isPublished = true;
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            'Video published successfully'
        )
    );

})

const getVideo = asyncHandler(async (req, res) => {

})

export {
    getAllVideos
}