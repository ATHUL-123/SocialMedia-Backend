const mongoose = require('mongoose')
const nodemon = require('nodemon');
// @desc    Mongoose configuration
// @file   < Config >
// @access  Private


const connect = async() => {
    try {
        await mongoose.connect("mongodb+srv://athultv702:Athul123@cluster0.z0i1vts.mongodb.net/SocialMedia")
        console.log('mongoDB is connected');
    } catch (error) {
        console.log(error);
        nodemon.restart();
    }
}

module.exports = connect;

