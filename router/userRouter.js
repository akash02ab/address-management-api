const express = require("express");
const router = express.Router();

const UserController = require("../controllers/userController");

router.post("/signup", async (req, res) => {
    const response = await UserController.addNewUser(req.body);

    const { status, result } = response;
    
    if (status) {
        res.status(200).json({result});
    } else {
        res.status(401).json({ error: result });
    }
});

router.post("/signin", async (req, res) => {
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

router.post("/signout", async (req, res) => {
    let response = await UserController.signOut(req.body.refreshToken);

    const {status, result} = response;

    if(status) {
        return res.status(200).json({result});
    }
    else {
        return res.status(401).json({error: result});
    }

});

module.exports = router;
