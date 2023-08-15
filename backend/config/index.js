import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION_STRING;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN_STRING;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN_STRING;
const BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH;
export {
  PORT,
  DATABASE_CONNECTION,
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  BACKEND_SERVER_PATH,
};
