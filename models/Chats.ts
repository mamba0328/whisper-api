import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChatsSchema = new Schema({
    is_group_chat: { type: Schema.Types.Boolean, default: false },
    chat_name: { type: Schema.Types.String, minLength: 1, maxLength: 120 },
    chat_users: [{ type: Schema.Types.ObjectId, ref: "users" }],

    status: { type: Schema.Types.String, enum: ["active", "deleted"], default: "active" },
    created_at: { type: Schema.Types.Date, default: new Date().toISOString() },
    updated_at: { type: Schema.Types.Date }
});

export const Chats = mongoose.model("chats", ChatsSchema);

// chats {
//     id bigint increments
//
//     is_group_chat bool
//     chat_name string
//
//     //Standart
//     status enum 0:Active 1:Deleted
//     created_at date
//     updated_at date
// }
