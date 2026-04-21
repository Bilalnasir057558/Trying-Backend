import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(500, "Something went wrong while finding the user in db");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken; // save generated token in the db
    await user.save( {validateBeforeSave: false} ) // tell mongoose to bypass schema validation for other fields such as password is required on save
                                                    //  b/c we are updating only the refresh token
    return {
        accessToken,
        refreshToken
    }

  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details
  const { username, email, fullName, password } = req.body;
  // console.log("Username " + username + '\n' + "Email " + email + '\n' +
  //             "FullName " + fullName + '\n' + "Password " + password + '\n');

  // validation
  if (
    [username, email, fullName, password].some(
      (field) => !field || (typeof field === "string" && !field.trim())
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // checks if user exists
  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExist) {
    throw new ApiError(409, "User already exists.");
  }

  // Check if images are uploaded
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  // if avatar is uploaded => path exists
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // classic way to check coverImage
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // upload images to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
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

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get login credentials for the user
  const { username, email, password } = req.body;

  // validation
  if ([username, email, password].some(field => 
    !field || (typeof field === "string" && !field.trim())
  )) {
    throw new ApiError(400, "All fields are required");
  }

  // find user in the db
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // confirm user
  if (!user) {
    throw new ApiError(404, "User does not exist.");
  }

  // match the password
  const isPasswordValid = await user.isPasswordCorrect(password);
  // console.log(isPasswordValid);

  // check if password matches or not
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // generating tokens for the valid user
  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

  // selecting the user without password and refresh token to display as response
  const validUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  
  if(!validUser) {
    throw new ApiError(500, "Something went wrong while signing in the user.");
  }

  // secure cookie config
  const options = {
    httpOnly: true,
    secure: true,
  };

  // providing tokens in cookie and also in json(for developing mobile apps, easy debugging and client-side logic)
  res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
        200, 
        {
            user: validUser, accessToken, refreshToken
        },
        "User logged in successfully"
    )
  )

});

const logoutUser = asyncHandler(async (req, res) => {

  // access to req.user because verifyJWT gives access if user is logged In
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined }
    },
    {
      returnDocument: "after" // gives updated document with no refresh token
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  // remove tokens from cookies
  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out successfully"));

});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // check cookies
  if(!req.cookies.refreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  // get refresh token from cookies or header
  const incomingRefreshToken = 
    req.cookies?.refreshToken ||
    req.header("Authorization").replace("Bearer ", "");

    // if no refresh token found
  if(!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // verify refresh token (signature match)
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    if(!decoded) {
      throw new ApiError(401, "Invalid refresh token");
    }
  
    // get user
    const user = await User.findById(decoded._id).select("-password");
  
    if(!user){
      throw new ApiError(401, "Invalid refresh token");
    }
  
    // compare refresh tokens
    if(incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }
  
    // if tokens match => generate new tokens
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {
      accessToken, refreshToken
    },
    "Access token refreshed successfully"
    ));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const updatePassword = asyncHandler(async (req, res) => {

  // user is logged in => access to req.user
  const user = await User.findById(req.user?._id);

  if(!user) {
    throw new ApiError(400, 'Unauthorized request.');
  }

  // get old and new password from the user
  const {oldPassword, newPassword} = req.body;

  if([oldPassword, newPassword].some(field => 
    !field || (typeof field === "string" && !field.trim()))) {
    throw new ApiError(400, 'All fields are required.');
  }

  console.log(oldPassword, newPassword);
  // match the old password in the db
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword, user.password);

  if(!isPasswordCorrect) {
    throw new ApiError(400, 'Old password is wrong.');
  }

  // if password matches => saves new pass to db
  user.password = newPassword;

  // save the new object
  await user.save({validateBeforeSave: false});

  return res
  .status(200)
  .json( 
    new ApiResponse(200, {}, "Password changed successfully.") 
  );

})

const updateOtherFields = asyncHandler(async (req, res) => {
  
  // get fields to update from the user
  const {fullName, email} = req.body;

  if([fullName, email].some(field => 
    !field || (typeof field === "string" && !field.trim())
  )) {
    throw new ApiError(400, 'All fields are required.');
  }

  // have access to req.user b/c user is logged in
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email
      }
    },
    {
      returnDocument: "after"
    }
  ).select("-password -refreshToken");

  if(!user) {
    throw new ApiError(400, 'Unauthorized access.');
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "Fields updated successfully.")
  );
})

const updateAvatar = asyncHandler(async (req, res) => {

  // we have access to req.file b/c whenever we upload, multer middleware uploads in it public/temp and attach it to req
  const avatarLocalPath = req.file?.path;

  if(!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is missing.');
  }

  // if avatar exists, uploads it on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if(!avatar) {
    throw new ApiError(400, 'Avatar file is required.');
  }

  // if upload successfully, update the avatar in the db
  await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: { avatar: avatar.url }
    }, {returnDocument: "after"}
  );

  return res
  .status(200)
  .json(
    new ApiResponse(200, {}, 'Avatar updated successfully.')
  );
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if(!coverImageLocalPath) {
    throw new ApiError(400, 'Cover image is missing.');
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!coverImage) {
    throw new ApiError(400, 'Cover image is required.');
  }

  await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: { coverImage: coverImage.url }
    }, {returnDocument: "after"}
  );

  return res
  .status(200)
  .json(
    new ApiResponse(200, {}, 'Cover image updated successfully.')
  );
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
  .status(200)
  .json(
    new ApiResponse(200, req.user, 'Current user fetched successfully.')
  );
})

export { 
  registerUser, 
  loginUser,  
  logoutUser, 
  refreshAccessToken, 
  updatePassword,
  updateOtherFields,
  updateAvatar,
  updateCoverImage,
  getCurrentUser
};
