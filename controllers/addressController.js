const Address = require("../models/address");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

async function addNewAddress(data) {
    try {
        const {accessToken} = data;
        
        delete data.accessToken;
        delete data.refreshToken;
        
        const address = new Address(data);
        const savedAddress = await address.save();
        const payload = jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);
        
        await User.findOneAndUpdate({email: payload.email}, { "$push": { "addressList": savedAddress._id } });

        return {status: true, result: savedAddress};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

async function deleteAddress(data) {
    try {
        const {addressline1, accessToken} = data;
        const thisAddress = await Address.findOneAndDelete({addressline1});
        const payload = jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);
       
        if(thisAddress) {
            await User.findOneAndUpdate({email: payload.email}, {"$pull": {"addressList": thisAddress._id}});
            return {status: true, result: "Address deleted"};
        }
        else {
            return {status: false, result: "No such address found"};
        }
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

async function updateAddress(data) {
    try {
        const {oldAddress, newAddress} = data;
        const thisAddress = await Address.findOneAndUpdate(oldAddress, newAddress, {new: true});

        if(thisAddress) {
            return {status: true, result: thisAddress};
        }
        else {
            return {status: false, result: "No such address found"};
        }
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

async function getAllAddress(data) {
    try {
        const payload = jwt.decode(data.accessToken, process.env.ACCESS_TOKEN_SECRET);
        const response = await User.findOne({email: payload.email}).populate("addressList");
        return {status: true, result: response.addressList};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

async function getAddress(data, param) {
    try {
        const payload = jwt.decode(data.accessToken, process.env.ACCESS_TOKEN_SECRET);
        const response = await User.findOne({email: payload.email}).populate("addressList");
        
        const address = response.addressList.filter(address => {
            let value = true;
            for(let key in param) {
                value = value && (param[key] == address[key]);
            }
            return value;
        });

        return {status: true, result: address};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

module.exports = {
    addNewAddress,
    deleteAddress,
    updateAddress,
    getAllAddress,
    getAddress,
};