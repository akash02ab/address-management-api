require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const PORT = 8080;
const userRouter = require("./router/userRouter");
const addressRouter = require("./router/addressRouter");

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/auth", userRouter);

app.use("/address", addressRouter);

app.all(/.*/, (req, res) => {
    res.statusCode = 404;
    res.send("Page not Found");
});

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});
