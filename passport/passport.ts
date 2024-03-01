import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { verifyFunction } from "./verifyFunction";

import { Users } from "../models/Users";
import { User } from "../types/types";

passport.use(
    new LocalStrategy(
        {
            usernameField: "identity_field",
            passwordField: "password"
        },
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        verifyFunction
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
passport.deserializeUser(async (user:User, done) => {
    try {
        const foundUser = await Users.findById(user._id);
        done(null, foundUser);
    } catch (err) {
        done(err);
    }
});

export default passport;
