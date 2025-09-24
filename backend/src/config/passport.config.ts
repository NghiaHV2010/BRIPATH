import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { PrismaClient } from "../generated/prisma";
import crypto from "crypto";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./env.config";

const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "/login/google/callback"
        },
        async (accessToken: string, refreshToken: string, profile: Profile, done) => {
            let user;

            try {
                user = await prisma.users.findFirst({
                    where: {
                        email: profile.emails?.[0].value
                    },
                    omit: {
                        password: true
                    }
                });

                if (!user) {
                    const buf = crypto.randomBytes(32);

                    user = await prisma.users.create({
                        data: {
                            username: profile.displayName,
                            // @ts-ignore
                            email: profile.emails?.[0].value,
                            password: buf.toString('hex'),
                            avatar_url: profile.photos?.[0].value,
                            role_id: 1
                        },
                        omit: {
                            password: true
                        }
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