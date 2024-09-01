import { Email } from "./email";

export class OTPMail {

    private static _otp: number;
    private static _action: 'FIRST_LOGIN' | 'FORGOT_PASSWORD';
        //private static _email:string;

    static get otp(): number {
        return OTPMail._otp;
    }

    static get action(): 'FIRST_LOGIN' | 'FORGOT_PASSWORD' {
        return OTPMail._action;
    }

    static set action(action) {
        OTPMail._action = action;
    }

    private static configOTP() {
        OTPMail._otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    }

    static firstLogin(address: string, name: string): Email {
        OTPMail.configOTP();
        return {
            address: address,
            subject: 'Acknowledge-Hub: Confirm Your Email and Update Your Password (Action required)',
            message: 'Dear ' + name + ',<br><br>Welcome to Acknowledge-Hub!<br><br>To complete your account setup, please:<br>Confirm Your Email:<br>Enter the following One-Time Password (OTP):<br><p style="color:gray;">' + OTPMail.otp + '</p>(Valid for 5 minutes)<br><br>Update Your Password:<br>You’ll be prompted to change your password upon your first login with the default one. This step is mandatory to secure your account.<br>If you need assistance, please contact IT Support.<br><br>Thank you for using Acknowledge-Hub.<br><br>Best regards,<br>The Acknowledge-Hub Team<br>ace@123.ai'
        };
    }

    static forgotPassword(address: string, name: string): Email {
        OTPMail.configOTP();
        return {
            address: address,
            subject: 'Acknowledge-Hub: Reset Your Password',
            message: 'Dear ' + name + ',<br><br>We received a request to reset your password for Acknowledge-Hub.To<br>reset your password, please use the One-Time Password (OTP) below:<br><p style="color:gray;">' + OTPMail.otp + '</p>(Valid for 5 minutes)<br><br>After entering the OTP, you’ll be prompted to create a new password.<br>If you did not request this change, please contact IT Support immediately.<br><br>Thank you for using Acknowledge-Hub.<br><br>Best regards,<br>The Acknowledge-Hub Team<br>ace@123.ai'
        };
    }


}