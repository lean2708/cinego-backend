const Brevo = require('@getbrevo/brevo');
require('dotenv').config();




async function sendEmail(toEmail, templateId, params = {}) {
    try {
        const apiInstance = new Brevo.TransactionalEmailsApi();

        apiInstance.setApiKey(
            Brevo.TransactionalEmailsApiApiKeys.apiKey,
            process.env.BREVO_API_KEY
        );

        const toName = params.full_name || "User";

        const sendSmtpEmail = {
            sender: {
                name: process.env.BREVO_SENDER_NAME,
                email: process.env.BREVO_SENDER_EMAIL
            },
            to: [{
                email: toEmail,
                name: toName
            }],
            templateId: templateId,
            params: params
        };

        console.log(`Sending email to ${toEmail} with params:`, JSON.stringify(params));

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log("Email sent successfully with ID:", response.body.messageId);

    } catch (error) {
        console.error("Error sending email:", error);
        console.log("Brevo error:", error.response?.data);
    }
}



async function sendOtpForgotPassword(toEmail, toName, otp, expiresIn){
    const templateId = parseInt(process.env.BREVO_OTP_FORGOT_PASSWORD_TEMPLATE_ID);

    const params = {
        name : toName,
        otp : otp,
        expiresIn : expiresIn
    }

    await sendEmail(toEmail, templateId, params);
}



async function sendContactReplyEmail(toEmail, toName, replyMessage) {
    const templateId = parseInt(process.env.BREVO_CONTACT_REPLY_TEMPLATE_ID);

    const params = {
        name: toName,
        replyMessage: replyMessage
    };

    await sendEmail(toEmail, templateId, params);
}



module.exports = {
    sendOtpForgotPassword,
    sendContactReplyEmail
};