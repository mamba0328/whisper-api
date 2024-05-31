type fileData = {
    _id: string,
    filename:string,
    path:string,
}
// eslint-disable-next-line
export const createEntityForUploadedImg = async (fields:any, MongooseModel:any):Promise<fileData | Error> => {
    if (!("file" in fields)) {
        return new Error("fields should include file");
    }
    const { filename, path, mimetype } = fields.file;

    delete fields.file;

    const newEntity:fileData = await MongooseModel.create({ filename, path, mimetype, ...fields });

    return newEntity;
};
