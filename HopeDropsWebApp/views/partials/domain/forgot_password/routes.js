import router from "express-router"
import express from "express";
import { sendPasswordResetOTPEmail } from "./controller";


router.post("/", async (req, res) => {
    try {
        
        const {email} = req.body;
        if(!email) throw Error("An email is required");

        const createdPasswordResetOTP = await sendPasswordResetOTPEmail(email);
        res.send(200).json(createdPasswordResetOTP);

    } catch (error) {
        res.status(400).send(error.message);


    }
})

module.exports = router;