import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // we have access to cookies (cookie parser)
    // getting token from cookie or header (in mobile apps)
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

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