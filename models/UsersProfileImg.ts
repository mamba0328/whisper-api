import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UsersProfileImgSchema = new Schema({
    filename: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true },
    path: { type: Schema.Types.String, minLength: 1, maxLength: 500, required: true },
    mimetype: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    created_at: { type: Schema.Types.Date, default: new Date().toISOString() },
    updated_at: { type: Schema.Types.Date }
});

export const UsersProfileImg = mongoose.model("users_profile_img", UsersProfileImgSchema);


// users_profile_img {
//     id number increments
//     filename string
//     path string
//     mimetype string
//
//     //Standard
//     created_at date
//     updated_at date
// }
