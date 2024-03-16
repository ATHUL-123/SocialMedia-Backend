const mongoose = require('mongoose')

// @desc    Mongoose configuration
// @file   < Config >
// @access  Private


const connect = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_SERVER)
        console.log('mongoDB is connected');
    } catch (error) {
        console.log(error);
    }
}

module.exports = connect;

