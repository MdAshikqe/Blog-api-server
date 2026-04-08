import { Server } from "http";
import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

async function DbConnectionServer() {
  try {
    await prisma.$connect;
    console.log("****** DB connect successfully");
  } catch (error) {
    console.error("DB connect failed");
    process.exit(1);
  }
}

async function main() {
  try {
    await DbConnectionServer();
    const server: Server = app.listen(config.port, () => {
      console.log(`Server is running port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
}

main();
