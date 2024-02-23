import mongoose from "mongoose";

const Schema = mongoose.Schema;

const now = new Date();

const UsersSchema = new Schema({
    first_name: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    last_name: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    username: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true, unique: true },
    date_of_birth: { type: Schema.Types.Date },
    user_profile_img_id: { type: Schema.Types.String, ref: "users_profile_img" },

    phone_number: { type: Schema.Types.String, minLength: 6, maxLength: 12, required: true, unique: true },
    email: { type: Schema.Types.String, minLength: 4, maxLength: 100, required: true, unique: true },
    password: { type: Schema.Types.String, minLength: 60, required: true },

    writes_in_chat: { type: Schema.Types.ObjectId, ref: "chats", default: null },
    is_online: { type: Schema.Types.Boolean, default: false },
    last_time_active: { type: Schema.Types.Date },

    status: { type: Schema.Types.String, enum: ["active", "deleted", "banned"], default: "active" },
    created_at: { type: Schema.Types.Date, default: now.toISOString() },
    updated_at: { type: Schema.Types.Date }
});

export const Users = mongoose.model("users", UsersSchema);


// users {
//     id number increments
//
//     //Personal data
//     first_name string
//     last_name string
//     username string unique
//     date_of_birth date
//     user_img string //filepath
//
//     //Login data
//     phone_number string unique
//     email string unique
//     password string
//     is_online bool
//     last_time_active date
//
//     //Standart
//     status enum 0:Active, 1:Deleted, 2:Banned
//     created_at date
//     updated_at date
// }
