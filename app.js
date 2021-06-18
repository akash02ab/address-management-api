require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");

const UserController = require("./controllers/userController");
const AddressController = require("./controllers/addressController");

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
    const {email, password, accessToken, refreshToken} = req.body;

    let response = UserController.verifyEmailAndPassword(email, password);

    if(!response.status) {
        return res.status(401).json({error: response.result});
    }

    if(!accessToken || !refreshToken) {
        return res.status(401).json({error: "Access Denied"});
    }

    response = await UserController.isTokenValid(email, accessToken, refreshToken);
    const {status, result} = response;
    
    if(status) {
        let token = await UserController.verifyAccessToken(email, accessToken);
        console.log(token)
        return res.status(200).json({status: "Login Successfull"});
    }
    else {
        return res.status(401).json({ error: result });
    }
});

app.post("/address", async (req, res) => {
    const response = await AddressController.addNewAddress(req.body);

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(500).json({result});
    }
});

app.delete("/address", async (req, res) => {
    const response = await AddressController.deleteAddress(req.body);
    
    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(500).json({result});
    }
});

app.put("/address", async (req, res) => {
    const response = await AddressController.updateAddress(req.body);

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(500).json({result});
    }
});

app.get("/address", async (req, res) => {
    const response = await AddressController.getAllAddress();

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(500).json({result});
    }
});

app.get("/address/:val", async (req, res) => {
    // console.log(req.params.val.city, req.query.state)
    const response = await AddressController.getAddress(req.params.val);

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(500).json({result});
    }
});

app.all(/.*/, (req, res) => {
    res.statusCode = 404;
    res.send("Page not Found");
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});
