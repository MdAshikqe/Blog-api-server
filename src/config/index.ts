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
};
