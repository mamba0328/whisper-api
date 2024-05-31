import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessagesImgSchema = new Schema({
    filename: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    message_id: { type: Schema.Types.ObjectId, ref: "chat_messages", required: true },
    path: { type: Schema.Types.String, minLength: 1, maxLength: 500, required: true },
    mimetype: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    created_at: { type: Schema.Types.Date, default: new Date().toISOString() },
    updated_at: { type: Schema.Types.Date }
});

export const MessagesImgs = mongoose.model("messages_imgs", MessagesImgSchema);


// messages_img {
//     id number increments
//     filename string
//     path string
//     mimetype string
//
//     //Standard
//     created_at date
//     updated_at date
// }
