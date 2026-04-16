import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

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

})

export {registerUser};