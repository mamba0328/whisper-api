import { Request } from "express";
import { FileFilterCallback } from "multer";
import { fiveMegaBytes } from "../../helpers/consts";

export const fileFilter = (req:Request, file:Express.Multer.File, cb:FileFilterCallback) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
        return cb(null, false);
        // throw new Error("Images supported only in next formats: jpg, jpeg, png, webp");
    }
    if (file.size > fiveMegaBytes) {
        return cb(null, false);
        // throw new Error(`Max size of the image should not exceed ${maxSizeInBytes / 1000} MB`);
    }
    return cb(null, true);
};
