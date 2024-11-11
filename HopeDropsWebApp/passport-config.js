import express from 'express';
import LocalStrategy from ('passport-local').Strategy;
import { passport, LocalStrategy } from './passportConfig';
import bcrypt from 'bcrypt';



function initialize(passport, getUserByEmail){
    const authenticateUser = (Email, Password, done) => {
        const user = getUserByEmail(Email)
            if (user == null){
                return done(null, false, {message: 'No user with that email'});
            }

            try {
                // if await
                if( bcrypt.compare(Password, user.Password)) {

                    return done(null, user);

                } else{
                return done(null, false, {message: 'Password is incorrect'});
            }


            } catch (error) {
                return done(error);
            }
    } 
    
    passport.use(new LocalStrategy ({usernameField: 'Email'},
    authenticateUser)
    );
    passport.serializeUser((user, done) => {})
    passport.deserializeUser((id, done) => {})
}

module.exports = initialize;