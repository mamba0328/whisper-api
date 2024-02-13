const mongoose = require("mongoose");
require("dotenv").config();
const nodeEnv = process.env.NODE_ENV;
const DB_URI = nodeEnv === "test"
    ? process.env.TEST_DB_MONGO_URI
    : process.env.MONGO_URI;

export async function connectToMongoDB (req:Request, res:Response, next:CallableFunction) {
    try {
        await mongoose.connect(DB_URI);
        console.log("Connected to MongoDB");
        next();
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export async function disconnectFromMongoDB (req:Request, res:Response, next:CallableFunction) {
    try {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
        next();
    } catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
    }
}
