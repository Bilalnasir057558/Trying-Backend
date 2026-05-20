import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { query, sortBy = 'createdAt', sortType = 'asc', userId } = req.query;

    // empty pipeline array
    let pipeline = [];

    // filter object containing match conditions with base condition that the videos must be published
    const filter = {
        isPublished: true
    };

    // if query (text to search) exists, match it with the title or description of videos, 'i' for case insensitive
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

    // create and push the lookup object
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
    let sort = {};
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
    const result = await Video.aggregatePaginate(aggregate, { page, limit});

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

export {
    getAllVideos
}