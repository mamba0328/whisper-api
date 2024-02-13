import mongoose from "mongoose";

const Schema = mongoose.Schema;

const now = new Date();

const MessageSeenBySchema = new Schema({
    message_id: { type: Schema.Types.ObjectId, ref: "chat_messages", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
    created_at: { type: Schema.Types.Date, default: now.toISOString() }
});

export const MessageSeenBy = mongoose.model("message_seen_by", MessageSeenBySchema);

// messages_seen_by{
//     id bigint increments
//     message_id bigint message.id
//     user_id bigint user.id
//     created_at date
// }
