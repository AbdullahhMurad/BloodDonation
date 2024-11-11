import User from '../models/user';
import { sendOTP } from "../otp/controller";


const sendPasswordResetOTPEmail = async (email) => {
    try {

        const existingUser =await User.findOne({email});

        if(!existingUser) throw Error("There's no account for the provided email");

        if(!existingUser.verified){
            throw Error("Email has not been verified yet");
        }

        const otpDetails = {
            email,
            subject: "Password reset",
            message: "Enter the code below to reset your password",
            duration: 1,
        }

        const createdOTP = await sendOTP(otpDetails);
        return createdOTP;

    } catch (error) {
        throw error;
    }
}

module.exports = {sendPasswordResetOTPEmail};