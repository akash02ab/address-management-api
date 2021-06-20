const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true,
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    addressline1: {
        type: String,
        required: true,
        unique: true
    },
    addressline2: {
        type: String
    },
    label: {
        type: String
    }
}, {timestamps: true});

const Address = mongoose.model("Address", AddressSchema);

module.exports = Address;