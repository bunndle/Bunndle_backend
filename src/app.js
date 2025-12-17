import express from 'express';
const app = express();
import userRouter from "./routes/userRoutes.js"
import cookieParser from 'cookie-parser';
import cors from "cors"


app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: true,   // reflects request origin
  credentials: true
}));


app.use("/api/user", userRouter);





export default app