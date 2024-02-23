import { body } from "express-validator";
export const validateImage = (key:string, maxSizeInBytes:number) => {
    return body(key).custom((value, { req }) => {
        if (!req.file) {
            return true;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (!["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype)) {
            throw new Error("Images supported only in next formats: jpg, jpeg, png, webp");
        }
        if (req.file.size > maxSizeInBytes) {
            throw new Error(`Max size of the image should not exceed ${maxSizeInBytes / 1000} MB`);
        }
    }).optional();
};
