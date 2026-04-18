import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // we have access to cookies (cookie parser)
    // getting token from cookie or header (in mobile apps)

    // if user is already logged out (optional b/c logged out user can't see log out button)
    if(!req.cookies.accessToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

     console.log(token);
    if(!token) {
        throw new ApiError(400, "Unauthorized request");
    }

    // verifying token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded);

    if (!decoded) {
      throw new ApiError(401, "Unauthorized");
    }

    // getting user using id if token is verified
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    // attach user to req -> access for features
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export {verifyJWT};