type fileData = {
    _id: string,
    filename:string,
    path:string,
}
// eslint-disable-next-line
export const createEntityForUploadedImg = async (file:any, MongooseModel:any):Promise<fileData> => {
    const { filename, path, mimetype } = file;

    const newEntity:fileData = await MongooseModel.create({ filename, path, mimetype });

    return newEntity;
};
