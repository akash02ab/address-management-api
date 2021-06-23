const Address = require("../models/address");
const User = require("../models/user");

async function addNewAddress(email, data) {
    try {
        const address = new Address(data);
        const savedAddress = await address.save();
        
        await User.findOneAndUpdate({email: email}, { "$push": { "addressList": savedAddress._id } });

        return {status: true, result: savedAddress};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

async function deleteAddress(email, data) {
    try {
        const {_id} = data;

        if(_id) {
            await User.findOneAndUpdate({email: email}, {"$pull": {"addressList": _id}});
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

async function getAllAddress(email) {
    try {
        const response = await User.findOne({email: email}).populate("addressList");
        return {status: true, result: response.addressList};
    }
    catch(err) {
        console.log(err.message)
        return {status: false, result: err.message};
    }
}

async function getAddress(email, param) {
    try {
        const response = await User.findOne({email: email}).populate("addressList");
        
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