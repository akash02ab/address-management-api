require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserController = require("./controllers/userController");

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/signup", async (req, res) => {
    const response = await UserController.addNewUser(req.body);

    const { status, result } = response;
    console.log(result);
    if (status) {
        res.status(200).json({result});
    } else {
        res.status(401).json({ error: result });
    }
});

app.post("/signin", async (req, res) => {
    const {email, token} = req.body;
    const {accessToken, refreshToken} = token;

    if(!accessToken || !refreshToken) {
        return res.status(401).json({error: "Access Denied"});
    }

    const response = await UserController.isTokenValid(email, accessToken, refreshToken);
    const {status, result} = response;
    
    if(status) {
        let token = await UserController.verifyAccessToken(accessToken);
        res.send(200).json(token);
    }
    else {
        res.status(401).json({ error: result });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});
