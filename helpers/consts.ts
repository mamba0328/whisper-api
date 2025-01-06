
import { config } from "dotenv";
config();

export const fiveMegaBytes = 5 * 10 ** 6;

export const USER_IDENTITY_FIELD_TYPES = {
    phone_number: "phone_number",
    email: "email",
    username: "username"
};

export const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_NAME!,
    api_key: process.env.CLOUDINARY_KEY!,
    api_secret: process.env.CLOUDINARY_SECRET!,
    secure: true
};
