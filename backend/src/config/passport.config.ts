import passport from "passport";
import crypto from "crypto";

import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./env.config";
import { userRepository } from "../repositories/user.repository";

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/login/google/callback"
        },
        async (accessToken: string, refreshToken: string, profile: Profile, done) => {
            let user;

            try {
                user = await userRepository.findByEmail(profile.emails?.[0].value);

                if (!user) {
                    const buf = crypto.randomBytes(32);

                    user = await userRepository.create({
                        // @ts-ignore
                        username: profile.displayName,
                        email: profile.emails?.[0].value,
                        password: buf.toString('hex'),
                        avatar_url: (profile as any).photos?.[0]?.value,
                        last_loggedIn: new Date()
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, undefined);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

export default passport;