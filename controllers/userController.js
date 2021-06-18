const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


async function addNewUser ({name, email, password}) {
    console.log(name, email, password);

    let emailRegex = /\S+@\S+\.\S+/;

    if(!name) {
        return {status: false, result: 'User name is required'};
    }

    if(!emailRegex.test(email)) {
        return {status: false, result: 'Invalid Email'};
    }

    if(!password) {
        return {status: false, result: 'Password is required'};
    }

    let hash = await bcrypt.hash(password, 10);

    try {
        const refreshToken = jwt.sign({email}, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXP_TIME,
        });

        const accessToken = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXP_TIME,
        });

        let user = new User({name: name, email: email, password: hash, accessToken: accessToken, refreshToken: refreshToken});
        let savedUser = await user.save();
        return {status: true, result: savedUser};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
} 

async function isTokenValid(email, accessToken, refreshToken) {
    try {
        const response = await User.findOne({email, accessToken, refreshToken});

        if(!response) {
            return {status: false, result: "Invalid token"};
        }
        else {
            return {status: true, result: 'Access'};
        }
    }
    catch(err) {
        return {status: false, result: err.message}; 
    }
}

async function verifyAccessToken(email, accessToken) {
    return jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err) => {
        if(err) {
            const newAccessToken = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: process.env.ACCESS_TOKEN_EXP_TIME,
            });
            console.log('newAccessToken', newAccessToken)
            return {status: 'Login success', accessToken: newAccessToken}; 
        } else {
            return {status: 'Login success', result: accessToken}; 
        }
      });
}

async function verifyEmailAndPassword(email, password) {
    try {
        let user = await userModel.findOne({email: email});
        
        if(user === null) {
            return {status: false, result: "Invalid Email"};
        }

        let result = await bcrypt.compare(password, user.password);
        
        if(!result) {
            return {status: false, result: "Invalid Password"};
        }

        return {status: true};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

module.exports = {
    addNewUser,
    isTokenValid,
    verifyAccessToken,
    verifyEmailAndPassword
} 