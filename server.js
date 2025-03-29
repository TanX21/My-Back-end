import { configDotenv } from "dotenv";
configDotenv({
    path: "./.env"
})
import express from "express"
import dbconnect from "./utils/dbconnect.js";
dbconnect();
import userRouter from "./Routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import favoriteRouter from "./Routes/favorite.route.js";
import adminrouter from "./Routes/admin.routes.js";

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CLIENT_BASE_URL,
    credentials: true,
}));

app.use("/api/user", userRouter)
app.use("/api/favorites", favoriteRouter);
app.use("/api/admin", adminrouter);

app.get("/", (req, res) =>{
    res.send("Server is running...");
});

app.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`); 
});