const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


function getAccessToken(email) {
    return jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXP_TIME,
    });
}

function getRefreshToken(email) {
    return jwt.sign({email}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXP_TIME,
    });
}

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
        let user = new User({name: name, email: email, password: hash});
        let savedUser = await user.save();
        return {status: true, result: savedUser};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

async function verifyEmailAndPassword(email, password) {
    try {
        let user = await User.findOne({email: email});
        
        if(user === null) {
            return {status: false, result: "Invalid Email"};
        }

        let result = await bcrypt.compare(password, user.password);
        
        if(!result) {
            return {status: false, result: "Invalid Password"};
        }

        const refreshToken = getRefreshToken(email);
        const accessToken = getAccessToken(email);

        let response  = await User.findOneAndUpdate({email}, {refreshToken});

        return {status: true, result: {accessToken, refreshToken}};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

async function isTokenValid(accessToken) {
    try {
        const payload = jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);
        
        const response = await User.findOne({email: payload.email});

        if(!response) {
            return {status: false, result: "Invalid token"};
        }
        else {
            let {refreshToken} = response;

            return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err) => {
                if(err) {
                    return {status: false, result: "Refresh token expired, login again to get new pair of token"};
                }
                else {
                    return {status: true, result: 'Access granted'};
                }
            });
        }
    }
    catch(err) {
        return {status: false, result: err.message}; 
    }
}


async function verifyAccessToken(accessToken) {
    return jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err) => {
        if(err) {
            if(err.message == "invalid signature") {
                return {status: false, result: "Invalid access token"};
            }
            else {
                const payload = jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);
                const newAccessToken = getAccessToken(payload.email);
                return {status: true, result: {accessToken: newAccessToken, email: payload.email}}; 
            }
        } else {
            return {status: true, result: accessToken}; 
        }
      });
}

async function signOut(refreshToken) {
    try {
        let response  = await User.findOneAndUpdate({refreshToken}, {refreshToken: ""});
        
        if(response) {
            return {status: true, result: "Logout successfull"};
        }
        else {
            return {status: false, result: "Invalid Token"}; 
        }
    }catch(err) {
        return {status: false, result: err.message}; 
    }
}


module.exports = {
    addNewUser,
    isTokenValid,
    verifyAccessToken,
    verifyEmailAndPassword,
    signOut
} 