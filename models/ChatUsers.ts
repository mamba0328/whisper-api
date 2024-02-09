import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChatUsersSchema = new Schema({
    chat_id: { type: Schema.Types.ObjectId, ref: "chats", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
    is_writing: { type: Schema.Types.Boolean, default: false }
});

export const ChatUsers = mongoose.model("chat_users", ChatUsersSchema);

// сhat_users {
//     id number increments
//     chat_id int *> chats.id
//     user_id uuid *>* users.id
//     is_writing bool
// }

