import express from "express";
import { PORT } from "./config/index.js";
import connectDb from "./database/database.js";
import router from "./routes/index.js";
import errorHandler from "./middleWare/errorHandler.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
connectDb();
app.use(express.json());
app.use(router);
app.use("/storage", express.static("storage"));
app.use(errorHandler);
app.listen(PORT, console.log(`server is running on PORT:${PORT}`));
