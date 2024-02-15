import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserWritingSchema = new Schema({
    chat_id: { type: Schema.Types.ObjectId, ref: "chats", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
    is_writing: { type: Schema.Types.Boolean, default: false }
});

export const UserWriting = mongoose.model("user_writing", UserWritingSchema);

// user_writing {
//     id number increments
//     chat_id int *> chats.id
//     user_id uuid *>* users.id
//     is_writing bool
// }

