import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserContactsSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
    contact_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
    created_at: { type: Schema.Types.Date, default: new Date() }
});

export const UserContacts = mongoose.model("user_contacts", UserContactsSchema);


// users_contacts {
//     id bigint increments
//     user number id
//     contact number user.id
//     created_at date
// }
