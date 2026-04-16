import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    
    // get user details
    const { username, email, fullName, password } = req.body;
    // console.log("Username " + username + '\n' + "Email " + email + '\n' +
    //             "FullName " + fullName + '\n' + "Password " + password + '\n');

    // validation
    if(!username.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
        throw new ApiError(400, "All fields are required");
    };

    // checks if user exists 
    const userExist = await User.findOne({
        $or: [{ username: username}, { email: email }]
    });

    if(userExist) {
        throw new ApiError(409, "User already exists.");
    }

    // Check if images are uploaded
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // if avatar is uploaded => path exists
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Create db entry
    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // we did'nt check coverImage is uploaded or not
    });

    // confirm entry in db => removing password and refresh token from response as a result of object creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // return response
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
})

export {registerUser};