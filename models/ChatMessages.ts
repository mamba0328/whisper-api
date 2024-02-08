import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ChatMessagesSchema = new Schema({
    chat_id:{type: Schema.Types.ObjectId, ref: 'chats', required: true },
    user_id:{type: Schema.Types.ObjectId, ref: 'users', required: true },

    body:{type: Schema.Types.String, minLength: 1, maxLength: 3000, required:true },
    img_url:{type: Schema.Types.String, minLength: 1, maxLength: 120 },
    status:{type: Schema.Types.String, enum:[ 'new', 'edited', 'deleted' ], default:'new',},

    created_at: {type: Schema.Types.Date, default: new Date(), },
    updated_at: {type: Schema.Types.Date,},
})

export const ChatMessages = mongoose.model('chat_messages', ChatMessagesSchema);


// chat_messages{
//     id
//     chat_id int *> chats.id
//     creator uuid > users.id
//
//     body string
//     img_url string

//     status enum //0:NEW 1:EDITED 2:DELETED
//     created_at date
//     updated_at date
// }
