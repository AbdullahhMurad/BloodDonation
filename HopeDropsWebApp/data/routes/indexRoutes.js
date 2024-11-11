import express from "express";
import userRoutes from "../domains/user";
import OTPRoutes from "../domains/otp";
import EmailVerificationRoutes from "../domains/email_verification";
import ForgotPasswordRoutes from "../domains/forgot_password";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/otp", OTPRoutes);
router.use("/email_verification", EmailVerificationRoutes);
router.use("/forgot_password", ForgotPasswordRoutes);

export default router;
