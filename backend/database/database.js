import mongoose from "mongoose";
import { DATABASE_CONNECTION } from "../config/index.js";

const connectDb = async () => {
  try {
    const con = await mongoose.connect(DATABASE_CONNECTION);
    console.log(`Database is connected to the Host:${con.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

export default connectDb;
