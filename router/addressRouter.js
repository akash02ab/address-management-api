const express = require("express");
const router = express.Router();

const AddressController = require("../controllers/addressController");
const UserController = require("../controllers/userController");

const verifyUser = async (req, res, next) => {
    // Get auth header value
    const bearerHeader = req.headers["authorization"];
    // Initialize bearer token to null
    let bearerToken = null;
    // Check if bearer is undefined
    if (typeof bearerHeader !== "undefined") {
        // Split at the space
        const bearer = bearerHeader.split(" ");
        // Get token from array
        bearerToken = bearer[1];
    } 
    else {
        // Forbidden
        res.status(403).json({ error: "Token not found" });
    }

    let response = await UserController.isTokenValid(bearerToken);
    
    const {status, result} = response;

    if(status) {
        response = await UserController.verifyAccessToken(bearerToken);
        
        if(response.status) {
            //send response from middleware to next callback
            req.email = response.result.email;
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

router.post("/", verifyUser, async (req, res) => {
    const response = await AddressController.addNewAddress(req.email, req.body);

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(401).json({result});
    }
});

router.delete("/", verifyUser, async (req, res) => {
    const response = await AddressController.deleteAddress(req.email, req.body);
    
    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(401).json({result});
    }
});

router.put("/", verifyUser, async (req, res) => {
    const response = await AddressController.updateAddress(req.body);

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(401).json({result});
    }
});

router.get("/", verifyUser, async (req, res) => {
    let response = null;
    const query = req.query;
    
    if(query) {
        response = await AddressController.getAddress(req.email, query);
    }
    else {
        response = await AddressController.getAllAddress(req.email);
    }

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(401).json({result});
    }
});

module.exports = router;
