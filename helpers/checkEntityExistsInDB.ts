
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkEntityExistsInDataBaseById = async (id:string, MongooseModel:any) => {
    // eslint-disable-next-line
    try {
        const entity = await MongooseModel.findById(id);
        if (!entity) {
            throw new Error("Entity doesn't exists");
        }
    } catch (error) {
        throw error;
    }
};
