import { AuthService } from "../services/auth/auth.service";
import { Email } from "./email";

export class Mail {

    constructor(private authService:AuthService){}

    private static _otp: number;
    private static _action: 'FIRST_LOGIN' | 'FORGOT_PASSWORD';

    static get otp(): number {
        return Mail._otp;
    }

    static get action(): 'FIRST_LOGIN' | 'FORGOT_PASSWORD' {
        return Mail._action;
    }

    static set action(action) {
        Mail._action = action;
    }

    private static configOTP() {
        Mail._otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    }

    static firstLogin(address: string, name: string): Email {
        Mail.configOTP();
        return {
            address: address,
            subject: 'Acknowledge-Hub: Confirm Your Email and Update Your Password (Action required)',
            message: 'Dear ' + name + ',<br><br>Welcome to Acknowledge-Hub!<br><br>To complete your account setup, please:<br>Confirm Your Email:<br>Enter the following One-Time Password (OTP):<br><p style="color:gray;">' + Mail.otp + '</p>(Valid for 5 minutes)<br><br>Update Your Password:<br>You’ll be prompted to change your password upon your first login with the default one. This step is mandatory to secure your account.<br>If you need assistance, please contact IT Support.<br><br>Thank you for using Acknowledge-Hub.<br><br>Best regards,<br>The Acknowledge-Hub Team<br>ace@123.ai'
        };
    }

    static forgotPassword(address: string, name: string): Email {
        Mail.configOTP();
        return {
            address: address,
            subject: 'Acknowledge-Hub: Reset Your Password',
            message: 'Dear ' + name + ',<br><br>We received a request to reset your password for Acknowledge-Hub.To<br>reset your password, please use the One-Time Password (OTP) below:<br><p style="color:gray;">' + Mail.otp + '</p>(Valid for 5 minutes)<br><br>After entering the OTP, you’ll be prompted to create a new password.<br>If you did not request this change, please contact IT Support immediately.<br><br>Thank you for using Acknowledge-Hub.<br><br>Best regards,<br>The Acknowledge-Hub Team<br>ace@123.ai'
        };
    }

    static addedMainHR(address:string, name: string, defaultPassword:string):Email{
        return{
            address: address,
            subject:' Important Login Information from Acknowledge Hub',
            message:'Dear '+name+',<br><br>I hope this message finds you well.<br><br>We are pleased to inform you that your  account has been successfully created. As part of our team, your role as Main HR is vital, and we are excited to have you onboard.<br><br>Please find below your login credentials:<br><br>Username - '+address+'<br>Temporary Password - '+defaultPassword+'<br>For security reasons, we recommend that you log in and change your password as soon as possible. Should you need any assistance or have any questions, feel free to reach out to our support team.<br><br>Thank you for your commitment, and we look forward to working closely with you through Acknowledge Hub.<br><br>Warm regards,<br>Acknowledge Hub Team'
        }
    }

}