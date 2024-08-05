import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from 'cors';

dotenv.config();

connectDB();

const corsOptions = {
    origin: ["http://localhost:3000", "http://www.api.jobslist.live", "http://api.jobslist.live", "https://www.api.jobslist.live", "https://api.jobslist.live", "https://www.jobslist.live", "https://main.d16idowmmspc1k.amplifyapp.com"], // Replace with your frontend origin
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    credentials: true
};

const app = express();
app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

app.use("/api/status", (req, res) => {
    res.json({ status: "ok" });
})
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);


app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

