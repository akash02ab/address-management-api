require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");

const UserController = require("./controllers/userController");
const AddressController = require("./controllers/addressController");

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

app.post("/signup", async (req, res) => {
    const response = await UserController.addNewUser(req.body);

    const { status, result } = response;
    
    if (status) {
        res.status(200).json({result});
    } else {
        res.status(401).json({ error: result });
    }
});

app.post("/signin", async (req, res) => {
    const {email, password} = req.body;

    let response = await UserController.verifyEmailAndPassword(email, password);
    
    const { status, result } = response;
    
    if(status) {
        return res.status(200).json({status: "login successful", token: result});
    }
    else {
        return res.status(401).json({error: result});
    }
});

app.post("/signout", async (req, res) => {
    let response = await UserController.signOut(req.body.refreshToken);

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(401).json({error: result});
    }

});

const verifyUser = async (req, res, next) => {
    const {accessToken, refreshToken} = req.body;
    
    if(!accessToken || !refreshToken) {
        return res.status(401).json({error: "Access Denied"});
    }

    let response = await UserController.isTokenValid(refreshToken);
    
    const {status, result} = response;

    if(status) {
        response = await UserController.verifyAccessToken(accessToken);
        
        if(response.status) {
            //how to send response from middleware to next callback
            next();
        }
        else {
            return res.status(401).json({error: response.result});
        }
    }
    else {
        return res.status(403).json({ error: result });
    }
}

app.post("/address", verifyUser, async (req, res) => {
    const response = await AddressController.addNewAddress(req.body);

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(500).json({result});
    }
});

app.delete("/address", verifyUser, async (req, res) => {
    const response = await AddressController.deleteAddress(req.body);
    
    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(500).json({result});
    }
});

app.put("/address", verifyUser, async (req, res) => {
    const response = await AddressController.updateAddress(req.body);

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(500).json({result});
    }
});

app.get("/address", verifyUser, async (req, res) => {
    let response = null;
    const query = req.query;
    
    if(query) {
        response = await AddressController.getAddress(req.body, query);
    }
    else {
        response = await AddressController.getAllAddress(req.body);
    }

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
