import dotenv from "dotenv";
import { Secret } from "jsonwebtoken";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV as string,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL as string,
  jwt: {
    access_token_secret: process.env.ACCESS_TOKEN_SECRET as Secret,
    access_token_secret_expires_in: process.env
      .ACCESS_TOKEN_EXPIRES_IN as string,
    refress_token_secret: process.env.REFRESS_TOKEN_SECRET as Secret,
    refress_token_secret_expires_in: process.env
      .REFRESS_TOKEN_EXPIRES_IN as string,
  },
  Better_Auth: {
    better_auth_secret: process.env.BETTER_AUTH_SECRET as string,
    better_auth_url: process.env.BETTER_AUTH_URL as string,
    better_auth_session_token_expires_in: process.env
      .BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as string,
    better_auth_session_token_update_age: process.env
      .BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as string,
  },
  email: {
    email_sender_smtp_user: process.env.EMAIL_SENDER_SMTP_USER as string,
    email_sender_smtp_pass: process.env.EMAIL_SENDER_SMTP_PASS as string,
    email_sender_smtp_host: process.env.EMAIL_SENDER_SMTP_HOST as string,
    email_sender_smtp_port: process.env.EMAIL_SENDER_SMTP_PORT as string,
    email_sender_smtp_from: process.env.EMAIL_SENDER_SMTP_FROM as string,
  },
  frontend_url: process.env.FRONTEND_URL as string,
  google: {
    google_client_id: process.env.GOOGLE_CLIENT_ID as string,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
  },
};
