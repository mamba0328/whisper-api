import mongoose from "mongoose";

const Schema = mongoose.Schema;

const now = new Date();

const UsersProfileImgSchema = new Schema({
    filename: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    path: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    mimetype: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    created_at: { type: Schema.Types.Date, default: now.toISOString() },
    updated_at: { type: Schema.Types.Date }
});

export const UsersProfileImg = mongoose.model("users_profile_img", UsersProfileImgSchema);


// users {
//     id number increments
//     filename string
//     path string
//
//     //Standard
//     created_at date
//     updated_at date
// }
