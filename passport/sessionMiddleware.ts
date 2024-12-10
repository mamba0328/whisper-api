require("dotenv").config();
import MongoStore from "connect-mongo";
import session from "express-session";
export default session({
    secret: process.env.PASSPORT_SECRET!,
    saveUninitialized: true,
    proxy: true,
    resave: true,
    store: MongoStore.create({
        mongoUrl: process.env.NODE_ENV === "test" ? process.env.TEST_DB_MONGO_URI : process.env.MONGO_URI,
        autoRemove: "native"
    }),
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV ? "none" : "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000 // day = hours * minutes * seconds * milliseconds
    }
});
