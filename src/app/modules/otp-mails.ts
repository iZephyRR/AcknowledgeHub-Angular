import { Email } from "./email";

export class OTPMail {

    private static _otp: number;

    static get otp(): number {
        return OTPMail._otp;
    }

    private static configOTP() {
        OTPMail._otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    }

    static firstLogin(address: string, name: string): Email {
        OTPMail.configOTP();
        return {
            address: address,
            subject: 'Acknowledge-Hub: Confirm Your Email and Update Your Password (Action required)',
            message: 'Dear ' + name + ',\n\nWelcome to Acknowledge-Hub!\n\nTo complete your account setup, please:\n\nConfirm Your Email:\n\nEnter the following One-Time Password (OTP):\nOTP: ' + OTPMail.otp + '\n(Valid for 5 minutes)\n\nUpdate Your Password:\nYou’ll be prompted to change your password upon your first login with the default one. This step is mandatory to secure your account.\n\nIf you need assistance, please contact IT Support.\n\nThank you for using Acknowledge-Hub.\n\nBest regards,\nThe Acknowledge-Hub Team\nace@123.ai'
        };
    }

    static forgotPassword(address: string, otp: number, name: string): Email {
        return {
            address: address,
            subject: 'Acknowledge-Hub: Reset Your Password',
            message: 'Dear ' + name + ',\n\nWe received a request to reset your password for Acknowledge-Hub.\n\nTo reset your password, please use the One-Time Password (OTP) below:\n\nOTP: '+OTPMail.otp+'\n(Valid for 10 minutes)\n\nAfter entering the OTP, you’ll be prompted to create a new password.\n\nIf you did not request this change, please contact IT Support immediately.\n\nThank you for using Acknowledge-Hub.\n\nBest regards,\nThe Acknowledge-Hub Team\nace@123.ai'
        };
    }


}