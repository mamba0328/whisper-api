import mongoose from "mongoose";

const Schema = mongoose.Schema;

const now = new Date();

const MessagesImgSchema = new Schema({
    filename: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    path: { type: Schema.Types.String, minLength: 1, maxLength: 500, required: true },
    mimetype: { type: Schema.Types.String, minLength: 1, maxLength: 100, required: true },
    created_at: { type: Schema.Types.Date, default: now.toISOString() },
    updated_at: { type: Schema.Types.Date }
});

export const MessagesImg = mongoose.model("messages_img", MessagesImgSchema);


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
