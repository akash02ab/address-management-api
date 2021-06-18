const Address = require("../models/address");

async function addNewAddress(data) {
    try {
        const address = new Address(data);
        const savedAddress = await address.save();
        return {status: true, result: savedAddress};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

async function deleteAddress(address) {
    try {
        const {pincode} = address;
        const thisAddress = await Address.deleteOne({pincode});
      
        if(thisAddress.deletedCount) {
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

async function updateAddress(address) {
    try {
        const thisAddress = await Address.findOneAndUpdate({}, address, {new: true});

        return {status: true, result: thisAddress};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

async function getAllAddress() {
    try {
        const addresses = await Address.find({});

        return {status: true, result: addresses};
    }
    catch(err) {
        return {status: false, result: err.message};
    }
}

async function getAddress(param) {
    try {
        const addresses = await Address.find({param});

        return {status: true, result: addresses};
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