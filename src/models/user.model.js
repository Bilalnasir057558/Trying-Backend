import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String, // url
        required: true,
    },
    coverImage: {
        type: String, // url
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ], 
    refreshToken: {
        type: String
    }
}, {timestamps: true})

export const User = mongoose.model('User', userSchema);