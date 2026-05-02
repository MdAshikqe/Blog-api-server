import nodemailer from "nodemailer";
import config from "../../config";
import path from "path";
import ejs from "ejs";
import AppError from "../errors/AppError";
import status from "http-status";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: config.email.email_sender_smtp_host,
  secure: true,
  auth: {
    user: config.email.email_sender_smtp_user,
    pass: config.email.email_sender_smtp_pass,
  },
  port: Number(config.email.email_sender_smtp_port),
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: config.email.email_sender_smtp_from,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attacment) => ({
        filename: attacment.filename,
        content: attacment.content,
        contentType: attacment.contentType,
      })),
    });
    console.log(`Email send to ${to} : ${info.messageId}`);
  } catch (error: any) {
    console.log("Email sending error", error.message);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};
