import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessagesImgSchema = new Schema({
    message_id: { type: Schema.Types.ObjectId, ref: "chat_messages", required: true },

    public_id: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    signature: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    version: { type: Schema.Types.Number, required: true },

    format: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    width: { type: Schema.Types.Number, required: true },
    height: { type: Schema.Types.Number, require: true },

    created_at: { type: Schema.Types.Date, default: new Date().toISOString() }
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
