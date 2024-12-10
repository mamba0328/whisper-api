import sharp from "sharp";
import { FileData } from "../types/types";

// eslint-disable-next-line
export const createEntityForUploadedImg = async (fields:any, MongooseModel:any):Promise<FileData> => {
    if (!("file" in fields)) {
        throw new Error("fields should include file");
    }

    const { filename, path, mimetype } = fields.file;

    const { width, height } = await sharp(path as string).metadata();
    delete fields.file;

    const newEntity: FileData = await MongooseModel.create({ filename, path, mimetype, width, height, ...fields });

    return newEntity;
};
