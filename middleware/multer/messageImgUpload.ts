import multer from "multer";
import path from "path";
import { fiveMegaBytes } from "../../helpers/consts";
import { fileFilter } from "./fileFilter";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../uploads/messages_imgs"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const fileExtension = file.mimetype.split("/").at(-1);
        const filename = `${file.fieldname}-${uniqueSuffix}.${fileExtension}`.trim().split(" ").join("_");

        cb(null, filename);
    }
});


export const messageImgUpload = multer({ storage, fileFilter, limits: { fileSize: fiveMegaBytes } });
